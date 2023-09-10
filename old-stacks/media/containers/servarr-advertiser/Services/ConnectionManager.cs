using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ServiceConnector.Client;

namespace ServarrAdvertiser.Services
{
    internal class ConnectionManager : IHostedService
    {
        private readonly ILogger<ConnectionManager> _logger;
        private readonly HubConnection _connection;
        
        public ConnectionManager(IHubConnectionFactory connectionFactory, ILogger<ConnectionManager> logger)
        {
            _logger = logger;
            _connection = connectionFactory.GetOrCreate();
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Opening hub connection");
            await _connection.StartAsync(cancellationToken);
            _logger.LogInformation("Opened hub connection");
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Closing hub connection");
            await _connection.StopAsync(cancellationToken);
            _logger.LogInformation("Closed hub connection");
        }
    }
}
