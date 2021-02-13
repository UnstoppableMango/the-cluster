using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using IndexPublisher.Clients;
using IndexPublisher.Models;
using IndexPublisher.Models.Jackett;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ServiceConnector.Client;
using Index = ServiceConnector.Protos.Index;

namespace IndexPublisher
{
    internal class ConfigWatcher : BackgroundService
    {
        private const string JackettConfigFile = "ServerConfig.json";
        private const string IndexersDir = "Indexers";

        private readonly IJackettClient _jackettClient;
        private readonly IIndexerClient _indexerClient;
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<ConfigWatcher> _logger;
        private readonly IDisposable _reloadToken;

        private PublisherOptions _options;
        private Dictionary<string, Indexer> _indexers = new(StringComparer.OrdinalIgnoreCase);

        public ConfigWatcher(
            IJackettClient jackettClient,
            IIndexerClient indexerClient,
            IHttpClientFactory clientFactory,
            IOptionsMonitor<PublisherOptions> optionsMonitor,
            ILogger<ConfigWatcher> logger)
        {
            _jackettClient = jackettClient;
            _indexerClient = indexerClient;
            _clientFactory = clientFactory;
            _options = optionsMonitor.CurrentValue;
            _reloadToken = optionsMonitor.OnChange(ReloadOptions);
            _logger = logger;
        }

        public override void Dispose()
        {
            _reloadToken.Dispose();
            base.Dispose();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (string.IsNullOrWhiteSpace(_options.ConfigDirectory))
            {
                _logger.LogError("Invalid config directory, sleeping for 10s");
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                stoppingToken.ThrowIfCancellationRequested();
            }

            _logger.LogInformation("Setting configDir from options");
            var configDir = _options.ConfigDirectory;

            _logger.LogInformation("Assuming ServerConfig.json location");
            var serverConfigFile = Path.Combine(configDir, JackettConfigFile);

            while (!File.Exists(serverConfigFile))
            {
                _logger.LogError("Unable to locate config file at {ServerConfigFile}", serverConfigFile);
                _logger.LogInformation("Sleeping for 10s");
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                stoppingToken.ThrowIfCancellationRequested();
            }

            _logger.LogInformation("Loading server config from {ServerConfigFile}", serverConfigFile);
            var serverConfigStream = File.OpenRead(serverConfigFile);

            ServerConfig? serverConfig;
            do
            {
                _logger.LogInformation("Deserializing server config");
                serverConfig = await JsonSerializer.DeserializeAsync<ServerConfig>(
                    serverConfigStream,
                    cancellationToken: stoppingToken);

                if (serverConfig != null) continue;

                _logger.LogInformation("Unable to load server config. Sleeping for 10s");
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                stoppingToken.ThrowIfCancellationRequested();
            } while (serverConfig == null);

            _logger.LogInformation("Combining paths for indexer dir");
            var indexerDir = Path.Combine(configDir, IndexersDir);
            _logger.LogInformation("Using {IndexerDir} as indexer dir", indexerDir);

            _logger.LogInformation("Performing initial indexer load");
            await LoadAllIndexers(stoppingToken);

            var indexers = _indexers.Select(x => x.Value);
            _logger.LogInformation("Performing initial indexer publish");
            // Nullable forgiveness reasoning:
            // We know JackettUrl will not be null because the HttpClient will have thrown on initialization otherwise
            await Task.WhenAll(indexers.Select(x => LoadIndexer(x, serverConfig, _options.JackettUrl!, stoppingToken)));

            _logger.LogInformation("Creating file watcher at {IndexerDir}", indexerDir);
            using var watcher = new FileSystemWatcher(configDir) {
                NotifyFilter = NotifyFilters.Size
                               | NotifyFilters.FileName
                               | NotifyFilters.LastAccess
                               | NotifyFilters.LastWrite,
            };

            _logger.LogInformation("Entering watch loop");
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Waiting for filesystem changes");
                var result = watcher.WaitForChanged(WatcherChangeTypes.All);
                _logger.LogInformation("Got change for {Name} - Type: {ChangeType}", result.Name, result.ChangeType);

                _logger.LogInformation("Trying to get file name without extension");
                var changedName = Path.GetFileNameWithoutExtension(result.Name) ?? string.Empty;
                _logger.LogInformation("Filename without extension - {ChangedName}", changedName);
                
                _logger.LogInformation("Checking if changed indexer has been cached");
                if (!_indexers.TryGetValue(changedName, out var indexer))
                {
                    _logger.LogInformation("Changed indexer was not cached");
                    
                    _logger.LogInformation("Reloading all indexers");
                    await LoadAllIndexers(stoppingToken);

                    indexer = _indexers[changedName];

                    if (indexer == null)
                    {
                        _logger.LogInformation("Still unable to find changed indexer, short-circuiting");
                        continue;
                    }
                }
                
                _logger.LogInformation("Loading new indexer");
                await LoadIndexer(indexer, serverConfig, _options.JackettUrl!, stoppingToken);
                
                _logger.LogInformation("Sleeping for 5s");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }

        private async Task LoadAllIndexers(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Fetching all indexers");
            var indexers = (await _jackettClient.GetIndexers(configured: true, cancellationToken)).ToList();
            _logger.LogInformation("Successfully fetched {Count} indexers", indexers.Count);
            throw new Exception("The fucking request completed but it's not logging shit");
            
            _logger.LogInformation("Saving all indexers as dictionary");
            _indexers = indexers.ToDictionary(x => x.name);
        }

        private async Task LoadIndexer(
            Indexer indexer,
            ServerConfig serverConfig,
            string jackettUrl,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("Loading indexer {Name}", indexer.name);

            _logger.LogInformation("Creating torznab feed");
            var feed = GetTorznabFeed(jackettUrl, indexer.id);
            _logger.LogInformation("Created torznab feed: {Feed}", feed);

            _logger.LogInformation("Creating index message");
            var index = new Index {
                Name = indexer.name,
                ApiKey = serverConfig.APIKey,
                TorznabFeed = feed,
            };

            try
            {
                _logger.LogInformation("Publishing index to connector");
                var reply = await _indexerClient.PublishAsync(index, cancellationToken);
                _logger.LogInformation("Received reply from connector: {Message}", reply.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unable to publish index {Name}", index.Name);
            }
        }

        private void ReloadOptions(PublisherOptions options)
        {
            _logger.LogInformation("Reloading options from configuration");
            _options = options;
        }

        private static string GetTorznabFeed(string baseUrl, string indexerId)
        {
            return $"{baseUrl}/api/v2.0/indexers/{indexerId}/results/torznab/";
        }
    }
}
