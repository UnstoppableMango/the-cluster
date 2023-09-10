using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using IndexPublisher.Models.Jackett;

namespace IndexPublisher.Clients
{
    public interface IJackettClient
    {
        Task<IEnumerable<Indexer>> GetIndexers(
            bool configured = true,
            CancellationToken cancellationToken = default);
    }
}
