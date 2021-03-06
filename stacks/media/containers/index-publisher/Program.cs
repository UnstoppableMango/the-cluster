using System;
using System.Collections.Generic;
using IndexPublisher.Clients;
using IndexPublisher.Models;
using IndexPublisher.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using ServiceConnector.Client;

namespace IndexPublisher
{
    public static class Program
    {
        public static void Main(string[] args) => CreateHostBuilder(args).Build().Run();

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, builder) => {
                    builder.AddKeyPerFile("/config/Jackett", optional: true);
                    builder.AddInMemoryCollection(new Dictionary<string, string> {
                        ["ConfigDirectory"] =
#if DEBUG
                            Environment.CurrentDirectory,
#else
                            "/config/Jackett",
#endif
                    });
                    builder.AddEnvironmentVariables("INDEXER_");
                })
                .ConfigureServices((hostContext, services) => {
                    services.Configure<PublisherOptions>(hostContext.Configuration);
                    services.AddHttpClient<IJackettClient, JackettClient>(client => {
                        var serverUrl = hostContext.Configuration["JackettUrl"];
                        client.BaseAddress = new Uri($"{serverUrl}/api/v2.0/");
                        client.Timeout = TimeSpan.FromSeconds(5);
                    });
                    services.AddServiceConnectorClient(options => {
                        options.Url = hostContext.Configuration["ConnectorUrl"];
                    });
                    services.AddSingleton<IIndexWatcher, IndexWatcher>();
                    services.AddHostedService<TimedIndexWatcherService>();
                    // TODO: Blocks startup
                    // services.AddHostedService<FileIndexWatcherService>();
                    services.AddHostedService<Worker>();
                })
                .UseSerilog(new LoggerConfiguration()
                    .Enrich.FromLogContext()
                    .WriteTo.Console(outputTemplate: "[{SourceContext:1} {Level:u3}] {Message:lj}{NewLine}{Exception}")
                    .WriteTo.Async(x => x.File("/config/publisher/log.txt"))
                    // .MinimumLevel.Verbose()
                    .CreateLogger());
    }
}
