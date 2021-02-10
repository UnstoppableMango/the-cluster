using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ServiceConnector
{
    internal class ConfigWatcher : BackgroundService
    {
        private const string JackettConfigFile = "ServerConfig.json";
        private const string IndexersDir = "Indexers";
        private const string ManagerConfigFile = "config.xml";
        
        private readonly ILogger<ConfigWatcher> _logger;

        public ConfigWatcher(ILogger<ConfigWatcher> logger)
        {
            _logger = logger;
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var watcher = new FileSystemWatcher("/config") {
                NotifyFilter = NotifyFilters.Size
                               | NotifyFilters.FileName
                               | NotifyFilters.LastAccess
                               | NotifyFilters.LastWrite,
                IncludeSubdirectories = true
            };

            _logger.LogInformation("Entering watch loop");
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Waiting for filesystem changes");
                var result = watcher.WaitForChanged(WatcherChangeTypes.All);
                _logger.LogInformation($"Got change for {result.Name} - Type: {result.ChangeType}");
            }
        }
    }
}
