using System.Threading;
using System.Threading.Tasks;
using ServiceConnector.Protos;

namespace ServiceConnector.Client
{
    internal class IndexerClient : IIndexerClient
    {
        private readonly IndexService.IndexServiceClient _client;

        public IndexerClient(IndexService.IndexServiceClient client)
        {
            _client = client;
        }
        
        public async Task<IndexReply> PublishAsync(IndexRequest index, CancellationToken cancellationToken = default)
        {
            return await _client.PublishAsync(index, null, null, cancellationToken);
        }
    }
}
