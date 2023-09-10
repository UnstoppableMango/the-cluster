using System;
using System.IO;
using System.Reactive.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using IndexPublisher.Models;
using IndexPublisher.Models.Jackett;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ServiceConnector.Client;

namespace IndexPublisher.Services
{
    internal class Worker : BackgroundService
    {
        private const string JackettConfigFile = "ServerConfig.json";

        private readonly IIndexerClient _indexerClient;
        private readonly IIndexWatcher _watcher;
        private readonly ILogger<Worker> _logger;
        private readonly IDisposable _reloadToken;

        private PublisherOptions _options;

        public Worker(
            IIndexerClient indexerClient,
            IIndexWatcher watcher,
            IOptionsMonitor<PublisherOptions> optionsMonitor,
            ILogger<Worker> logger)
        {
            _indexerClient = indexerClient;
            _watcher = watcher;
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

            // Should loop until the watcher completes
            _logger.LogInformation("Beginning watcher enumeration");
            foreach (var indexer in _watcher.Next())
            {
                _logger.LogInformation("Creating torznab feed");
                // We know the url isn't null because the HttpClient would have thrown otherwise
                var feed = GetTorznabFeed(_options.JackettUrl!, indexer.id);
                _logger.LogInformation("Created torznab feed: {Feed}", feed);
                
                await LoadIndexer(indexer, serverConfig, feed, stoppingToken);
            }
            _logger.LogInformation("Exiting watcher enumeration");
        }

        private async Task LoadIndexer(
            Indexer indexer,
            ServerConfig serverConfig,
            string torznabFeed,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("Loading indexer {Name}", indexer.name);

            try
            {
                _logger.LogInformation("Publishing index to connector");
                var reply = await _indexerClient.PublishAsync(
                    indexer.name,
                    torznabFeed,
                    serverConfig.APIKey,
                    cancellationToken);
                _logger.LogInformation("Received reply from connector: {Message}", reply.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unable to publish index {Name}", indexer.name);
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
