using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using ServiceConnector.Protos;

namespace ServiceConnector.Services
{
    public class IndexPublisherService : Indexer.IndexerBase
    {
        private readonly ILogger<IndexPublisherService> _logger;

        public IndexPublisherService(ILogger<IndexPublisherService> logger)
        {
            _logger = logger;
        }
        
        public override Task<IndexReply> Publish(Index request, ServerCallContext context)
        {
            return base.Publish(request, context);
        }
    }
}
