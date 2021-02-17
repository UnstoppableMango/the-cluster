using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using IndexPublisher.Clients;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace IndexPublisher.Services
{
    public class TimedIndexWatcherService : BackgroundService
    {
        private readonly IJackettClient _jackettClient;
        private readonly IIndexWatcher _watcher;
        private readonly ILogger<TimedIndexWatcherService> _logger;

        public TimedIndexWatcherService(
            IJackettClient jackettClient,
            IIndexWatcher watcher,
            ILogger<TimedIndexWatcherService> logger)
        {
            _jackettClient = jackettClient;
            _watcher = watcher;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting timed watcher service");
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Waiting to fetch indexers. 30s");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                _logger.LogInformation("Finished waiting, continuing");

                try
                {
                    _logger.LogInformation("Fetching all indexers");
                    var indexers = (await _jackettClient.GetIndexers(configured: true, stoppingToken)).ToList();
                    _logger.LogInformation("Successfully fetched {Count} indexers", indexers.Count);
                    
                    if (indexers.Count <= 0) continue;
                    
                    _logger.LogInformation("Notifying watcher of loaded indexers");
                    foreach (var indexer in indexers)
                    {
                        _logger.LogInformation("Notifying for indexer {Name}", indexer.name);
                        _watcher.OnNext(indexer);
                        _logger.LogInformation("Successfully notified for indexer {Name}", indexer.name);
                    }
                }
                catch (HttpRequestException e)
                {
                    // Call OnError on watcher? Or ignore?
                    _logger.LogError(e, "Unable to connect to jackett");
                }
            }
            
            _logger.LogInformation("Exited service loop");
            _logger.LogInformation("Completing index watcher");
            _watcher.OnCompleted();
        }
    }
}
