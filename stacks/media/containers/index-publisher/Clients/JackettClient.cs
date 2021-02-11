using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using IndexPublisher.Models.Jackett;
using Microsoft.Extensions.Logging;

namespace IndexPublisher.Clients
{
    public class JackettClient : IJackettClient
    {
        private readonly HttpClient _client;
        private readonly ILogger<JackettClient> _logger;

        public JackettClient(HttpClient client, ILogger<JackettClient> logger)
        {
            _client = client;
            _logger = logger;
        }
        
        public async Task<IEnumerable<Indexer>> GetIndexers(
            bool configured = true,
            CancellationToken cancellationToken = default)
        {
            var uri = $"indexers?configured={configured}";
            _logger.LogInformation("Fetching all indexers. configured = {Configured}", configured);
            var result = await _client.GetFromJsonAsync<IEnumerable<Indexer>>(uri, cancellationToken);
            return result ?? throw new NotSupportedException("Can't handle null response at this time");
        }
    }
}
