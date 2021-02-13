using System.Threading;
using System.Threading.Tasks;
using ServiceConnector.Protos;

namespace ServiceConnector.Client
{
    public interface IIndexerClient
    {
        Task<IndexReply> PublishAsync(Index index, CancellationToken cancellationToken = default);
    }
}
