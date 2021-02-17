using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Serilog;

namespace ServiceConnector.Client
{
    internal class HubConnectionFactory : IHubConnectionFactory
    {
        private readonly IOptionsMonitor<ServiceConnectorClientOptions> _optionsMonitor;
        private readonly IOptionsMonitor<HubConnectionOptions> _connectionOptions;
        private readonly ILogger<HubConnectionFactory> _logger;
        private readonly ConcurrentDictionary<string, HubConnection> _connections = new();

        public HubConnectionFactory(
            IOptionsMonitor<ServiceConnectorClientOptions> optionsMonitor,
            IOptionsMonitor<HubConnectionOptions> connectionOptions,
            ILogger<HubConnectionFactory> logger)
        {
            _optionsMonitor = optionsMonitor;
            _connectionOptions = connectionOptions;
            _logger = logger;
        }

        public HubConnection GetOrCreate(string name)
        {
            _logger.LogInformation("Getting or creating connection for {Name}", name);
            var connection = _connections.GetOrAdd(name, Create);
            
            _logger.LogInformation("Adding connection factory events for {Name}", name);
            // TODO: Maybe need to worry about event cleanup? It's probably fine for my purposes...
            connection.Closed += e => {
                _logger.LogInformation("Removing connection {Name} from factory", name);
                var removed = _connections.TryRemove(name, out _);
                _logger.LogInformation("Removed connection {Name}: {Removed}", name, removed);
                return Task.CompletedTask;
            };
            connection.Reconnected += id => {
                _logger.LogInformation("Connection {Name} reconnected with id {Id}", name, id);
                var added = _connections.TryAdd(name, connection);
                _logger.LogInformation("Connection {Name} reconnected {Added}", name, added);
                return Task.CompletedTask;
            };
            _logger.LogInformation("Added connection factory events");

            return connection;
        }

        private HubConnection Create(string name)
        {
            _logger.LogInformation("Creating url for connection {Name}", name);
            var options = _connectionOptions.Get(name);
            var url = Path.Combine(
                _optionsMonitor.CurrentValue.Url ?? throw new InvalidOperationException("Invalid base url"),
                options.Path ?? throw new InvalidOperationException("Invalid connection path"));
            _logger.LogInformation("Created url {Url} for {Name}", url, name);
            
            _logger.LogInformation("Creating connection for {Name}", name);
            var connection = new HubConnectionBuilder()
                .WithUrl(url)
                .WithAutomaticReconnect()
                .ConfigureLogging(x => x.AddSerilog())
                .Build();
            _logger.LogInformation("Created connection for {Name}", name);
            return connection;
        }
    }
}
