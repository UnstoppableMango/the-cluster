using System;
using Grpc.Net.ClientFactory;
using Microsoft.Extensions.DependencyInjection;
using ServiceConnector.Protos;

namespace ServiceConnector.Client
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddServiceConnectorClient(
            this IServiceCollection services,
            Action<GrpcClientFactoryOptions> configureClient)
        {
            services.AddGrpcClient<Indexer.IndexerClient>(configureClient);
            services.AddTransient<IIndexerClient, IndexerClient>();

            return services;
        }
    }
}
