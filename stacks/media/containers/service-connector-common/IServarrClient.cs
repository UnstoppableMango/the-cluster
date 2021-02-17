using System.Threading;
using System.Threading.Tasks;

namespace ServiceConnector.Protos
{
    public interface IServarrClient
    {
        Task<string> GetApiKeyAsync(CancellationToken cancellationToken = default);

        Task<bool> ShouldImportAsync(IndexRequest request, CancellationToken cancellationToken = default);

        Task ImportAsync(IndexRequest request, CancellationToken cancellationToken = default);
    }
}
