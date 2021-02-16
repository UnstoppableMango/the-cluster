using Microsoft.AspNetCore.SignalR.Client;

namespace ServiceConnector.Client
{
    public interface IHubConnectionFactory
    {
        HubConnection GetOrCreate(string name);
    }
}
