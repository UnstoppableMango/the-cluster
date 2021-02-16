using System;
using Grpc.Net.ClientFactory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using ServiceConnector.Protos;

namespace ServiceConnector.Client
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddServiceConnectorClient(
            this IServiceCollection services,
            Action<ServiceConnectorClientOptions> configure)
        {
            services.AddLogging();
            services.Configure(configure);

            services.Configure<HubConnectionOptions>(HubConnectionOptions.DefaultName, options => {
                options.Path = "/servarr";
            });
            
            services.AddTransient<IIndexerClient, IndexerClient>();
            services.AddGrpcClient<IndexService.IndexServiceClient>((sp, options) => {
                var clientOpts = sp.GetRequiredService<IOptions<ServiceConnectorClientOptions>>();
                options.Address = new Uri(clientOpts.Value.Url ?? string.Empty);
            });

            services.AddSingleton<IHubConnectionFactory, HubConnectionFactory>();
            services.AddTransient<IServarrHub, ServarrHubProxy>();

            return services;
        }
    }
}
