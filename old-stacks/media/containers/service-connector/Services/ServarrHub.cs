using Microsoft.AspNetCore.SignalR;
using ServiceConnector.Protos;

namespace ServiceConnector.Services
{
    public class ServarrHub : Hub<IServarrClient>, IServarrHub
    {
        
    }
}
