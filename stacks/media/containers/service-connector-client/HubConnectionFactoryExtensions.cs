using Microsoft.AspNetCore.SignalR.Client;

namespace ServiceConnector.Client
{
    public static class HubConnectionFactoryExtensions
    {
        public static HubConnection GetOrCreate(this IHubConnectionFactory factory)
            => factory.GetOrCreate(HubConnectionOptions.DefaultName);
    }
}
