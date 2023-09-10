using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Logging;
using ServiceConnector.Client;
using ServiceConnector.Protos;

namespace ServarrAdvertiser.Clients
{
    internal class ServarrClient : IServarrClient
    {
        private readonly ILogger<ServarrClient> _logger;

        public ServarrClient(IHubConnectionFactory connectionFactory, ILogger<ServarrClient> logger)
        {
            _logger = logger;
            
            var connection = connectionFactory.GetOrCreate();
            connection.On<CancellationToken>(nameof(GetApiKeyAsync), GetApiKeyAsync);
            connection.On<IndexRequest, CancellationToken>(nameof(ShouldImportAsync), ShouldImportAsync);
            connection.On<IndexRequest, CancellationToken>(nameof(ImportAsync), ImportAsync);
        }
        
        public Task<string> GetApiKeyAsync(CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Got request for API key");
            throw new System.NotImplementedException();
        }

        public Task<bool> ShouldImportAsync(IndexRequest request, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public Task ImportAsync(IndexRequest request, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }
    }
}
