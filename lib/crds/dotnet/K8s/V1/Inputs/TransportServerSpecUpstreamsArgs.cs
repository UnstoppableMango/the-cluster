// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.K8s.V1
{

    /// <summary>
    /// TransportServerUpstream defines an upstream.
    /// </summary>
    public class TransportServerSpecUpstreamsArgs : global::Pulumi.ResourceArgs
    {
        [Input("backup")]
        public Input<string>? Backup { get; set; }

        [Input("backupPort")]
        public Input<int>? BackupPort { get; set; }

        [Input("failTimeout")]
        public Input<string>? FailTimeout { get; set; }

        /// <summary>
        /// TransportServerHealthCheck defines the parameters for active Upstream HealthChecks.
        /// </summary>
        [Input("healthCheck")]
        public Input<Pulumi.Kubernetes.Types.Inputs.K8s.V1.TransportServerSpecUpstreamsHealthCheckArgs>? HealthCheck { get; set; }

        [Input("loadBalancingMethod")]
        public Input<string>? LoadBalancingMethod { get; set; }

        [Input("maxConns")]
        public Input<int>? MaxConns { get; set; }

        [Input("maxFails")]
        public Input<int>? MaxFails { get; set; }

        [Input("name")]
        public Input<string>? Name { get; set; }

        [Input("port")]
        public Input<int>? Port { get; set; }

        [Input("service")]
        public Input<string>? Service { get; set; }

        public TransportServerSpecUpstreamsArgs()
        {
        }
        public static new TransportServerSpecUpstreamsArgs Empty => new TransportServerSpecUpstreamsArgs();
    }
}
