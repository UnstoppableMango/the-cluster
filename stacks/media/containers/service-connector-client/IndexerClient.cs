using System.Threading;
using System.Threading.Tasks;
using ServiceConnector.Protos;

namespace ServiceConnector.Client
{
    internal class IndexerClient : IIndexerClient
    {
        private readonly Indexer.IndexerClient _client;

        public IndexerClient(Indexer.IndexerClient client)
        {
            _client = client;
        }
        
        public async Task<IndexReply> PublishAsync(Index index, CancellationToken cancellationToken = default)
        {
            return await _client.PublishAsync(index, null, null, cancellationToken);
        }
    }
}
