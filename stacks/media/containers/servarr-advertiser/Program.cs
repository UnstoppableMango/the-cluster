using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using ServarrAdvertiser.Services;
using ServiceConnector.Client;

namespace ServarrAdvertiser
{
    public static class Program
    {
        public static void Main(string[] args) => CreateHostBuilder(args).Build().Run();

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostContext, builder) => {
                    builder.AddEnvironmentVariables("ADVERTISER_");
                })
                .ConfigureServices((hostContext, services) => {
                    services.AddServiceConnectorClient(options => {
                        options.Url = hostContext.Configuration["ConnectorUrl"];
                    });
                    
                    services.AddHostedService<ConnectionManager>();
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
