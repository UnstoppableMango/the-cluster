// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecLivenessArgs : global::Pulumi.ResourceArgs
    {
        [Input("exec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecLivenessExecArgs>? Exec { get; set; }

        [Input("failureThreshold")]
        public Input<int>? FailureThreshold { get; set; }

        [Input("grpc")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecLivenessGrpcArgs>? Grpc { get; set; }

        [Input("httpGet")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecLivenessHttpGetArgs>? HttpGet { get; set; }

        [Input("initialDelaySeconds")]
        public Input<int>? InitialDelaySeconds { get; set; }

        [Input("periodSeconds")]
        public Input<int>? PeriodSeconds { get; set; }

        [Input("successThreshold")]
        public Input<int>? SuccessThreshold { get; set; }

        [Input("tcpSocket")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecLivenessTcpSocketArgs>? TcpSocket { get; set; }

        [Input("terminationGracePeriodSeconds")]
        public Input<int>? TerminationGracePeriodSeconds { get; set; }

        [Input("timeoutSeconds")]
        public Input<int>? TimeoutSeconds { get; set; }

        public TenantSpecLivenessArgs()
        {
        }
        public static new TenantSpecLivenessArgs Empty => new TenantSpecLivenessArgs();
    }
}
