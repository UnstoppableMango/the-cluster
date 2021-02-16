using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using ServiceConnector.Protos;

namespace ServiceConnector.Services
{
    internal class IndexReceiverService : IndexService.IndexServiceBase
    {
        private readonly IHubContext<ServarrHub, IServarrClient> _hubContext;
        private readonly ILogger<IndexReceiverService> _logger;

        public IndexReceiverService(
            IHubContext<ServarrHub, IServarrClient> hubContext,
            ILogger<IndexReceiverService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public override Task<IndexReply> Publish(IndexRequest request, ServerCallContext context)
        {
            _logger.LogInformation("Got publish index request");

            // _hubContext.Clients.All
            return Task.FromResult(new IndexReply { Message = "Unimplemented atm" });
        }
    }
}
