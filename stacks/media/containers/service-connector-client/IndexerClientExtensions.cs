using System.Threading;
using System.Threading.Tasks;
using ServiceConnector.Protos;

namespace ServiceConnector.Client
{
    public static class IndexerClientExtensions
    {
        public static Task<IndexReply> PublishAsync(
            this IIndexerClient client,
            string name,
            string torznabFeed,
            string apiKey,
            CancellationToken cancellationToken = default)
            => client.PublishAsync(
                new IndexRequest { Name = name, ApiKey = apiKey, TorznabFeed = torznabFeed },
                cancellationToken);
    }
}
