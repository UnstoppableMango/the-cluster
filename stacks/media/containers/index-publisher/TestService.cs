using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace IndexPublisher
{
    public class TestService : BackgroundService
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<TestService> _logger;

        public TestService(IHttpClientFactory clientFactory, ILogger<TestService> logger)
        {
            _clientFactory = clientFactory;
            _logger = logger;
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.WhenAll(
                Get1(),
                Get2(stoppingToken),
                Get3(stoppingToken));
            
            _logger.LogInformation("Exiting test service");
        }

        private async Task Get1()
        {
            var client = _clientFactory.CreateClient();
            var newCts = new CancellationTokenSource();
            _logger.LogInformation("Performing test call with custom cts");
            await client.GetAsync("http://127.0.0.1:9117/api/v2.0/indexers?configured=true", newCts.Token);
            _logger.LogInformation("Got response from test call");
        }

        private async Task Get2(CancellationToken cancellationToken)
        {
            var client = _clientFactory.CreateClient();
            _logger.LogInformation("Performing test call");
            await client.GetStringAsync("http://127.0.0.1:9117/api/v2.0/indexers?configured=true", cancellationToken);
            _logger.LogInformation("Got response from test call");
        }

        private async Task Get3(CancellationToken cancellationToken)
        {
            var client = new HttpClient();
            _logger.LogInformation("Performing test with barebones client");
            var result = await client.GetAsync("http://127.0.0.1/", cancellationToken);
            _logger.LogInformation("Got response from test client");
        }
    }
}
