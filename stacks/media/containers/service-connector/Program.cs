using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace ServiceConnector
{
    public static class Program
    {
        public static void Main(string[] args) => CreateHostBuilder(args).Build().Run();

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
                .UseSerilog(new LoggerConfiguration()
                    .Enrich.FromLogContext()
                    .WriteTo.Console(outputTemplate: "[{SourceContext:1} {Level:u3}] {Message:lj}{NewLine}{Exception}")
                    .WriteTo.Async(x => x.File("/config/publisher/log.txt"))
                    // .MinimumLevel.Verbose()
                    .CreateLogger());
    }
}
