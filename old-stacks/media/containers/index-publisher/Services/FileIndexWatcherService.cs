using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using IndexPublisher.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IndexPublisher.Services
{
    public class FileIndexWatcherService : BackgroundService
    {
        private const string IndexersDir = "Indexers";

        private readonly IIndexWatcher _watcher;
        private readonly ILogger<FileIndexWatcherService> _logger;
        private readonly IDisposable _reloadToken;
        
        private PublisherOptions _options;

        public FileIndexWatcherService(
            IIndexWatcher watcher,
            IOptionsMonitor<PublisherOptions> optionsMonitor,
            ILogger<FileIndexWatcherService> logger)
        {
            _watcher = watcher;
            _options = optionsMonitor.CurrentValue;
            _reloadToken = optionsMonitor.OnChange(ReloadOptions);
            _logger = logger;
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
            
            _logger.LogInformation("Combining paths for indexer dir");
            var indexerDir = Path.Combine(configDir, IndexersDir);
            _logger.LogInformation("Using {IndexerDir} as indexer dir", indexerDir);

            _logger.LogInformation("Creating file watcher at {IndexerDir}", indexerDir);
            using var watcher = new FileSystemWatcher(indexerDir) {
                NotifyFilter = NotifyFilters.Size
                               | NotifyFilters.FileName
                               | NotifyFilters.LastAccess
                               | NotifyFilters.LastWrite,
            };

            _logger.LogInformation("Entering file watcher loop");
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Waiting for filesystem changes");
                var result = watcher.WaitForChanged(WatcherChangeTypes.All);
                _logger.LogInformation("Got change for {Name} - Type: {ChangeType}", result.Name, result.ChangeType);

                _logger.LogInformation("Trying to get file name without extension");
                var changedName = Path.GetFileNameWithoutExtension(result.Name) ?? string.Empty;
                _logger.LogInformation("Filename without extension - {ChangedName}", changedName);
                
                // TODO: How do we actually reload from here?
                // Can't get from jackett, it doesn't have a single fetch endpoint
            }
            
            _logger.LogInformation("Exiting file watcher loop");
            _logger.LogInformation("Disposing reload token");
            _reloadToken.Dispose();
        }

        private void ReloadOptions(PublisherOptions options)
        {
            _logger.LogInformation("Reloading options from configuration");
            _options = options;
        }
    }
}
