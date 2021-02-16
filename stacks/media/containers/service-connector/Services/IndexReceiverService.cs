using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using ServiceConnector.Protos;

namespace ServiceConnector.Services
{
    internal class IndexReceiverService : IndexService.IndexServiceBase
    {
        private readonly ILogger<IndexReceiverService> _logger;

        public IndexReceiverService(ILogger<IndexReceiverService> logger)
        {
            _logger = logger;
        }
        
        public override Task<IndexReply> Publish(IndexRequest request, ServerCallContext context)
        {
            _logger.LogInformation("Get publish index request");
            return Task.FromResult(new IndexReply { Message = "Unimplemented atm" });
        }
    }
}
