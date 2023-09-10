using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Logging;
using ServiceConnector.Protos;

namespace ServiceConnector.Client
{
    internal class ServarrHubProxy : IServarrHub
    {
        private readonly ILogger<ServarrHubProxy> _logger;
        private readonly HubConnection _connection;

        public ServarrHubProxy(
            IHubConnectionFactory connectionFactory,
            ILogger<ServarrHubProxy> logger)
        {
            _connection = connectionFactory.GetOrCreate();
            _logger = logger;
        }
    }
}
