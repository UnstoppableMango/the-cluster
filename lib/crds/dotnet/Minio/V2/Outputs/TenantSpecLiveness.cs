// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Minio.V2
{

    [OutputType]
    public sealed class TenantSpecLiveness
    {
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessExec Exec;
        public readonly int FailureThreshold;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessGrpc Grpc;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessHttpGet HttpGet;
        public readonly int InitialDelaySeconds;
        public readonly int PeriodSeconds;
        public readonly int SuccessThreshold;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessTcpSocket TcpSocket;
        public readonly int TerminationGracePeriodSeconds;
        public readonly int TimeoutSeconds;

        [OutputConstructor]
        private TenantSpecLiveness(
            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessExec exec,

            int failureThreshold,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessGrpc grpc,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessHttpGet httpGet,

            int initialDelaySeconds,

            int periodSeconds,

            int successThreshold,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLivenessTcpSocket tcpSocket,

            int terminationGracePeriodSeconds,

            int timeoutSeconds)
        {
            Exec = exec;
            FailureThreshold = failureThreshold;
            Grpc = grpc;
            HttpGet = httpGet;
            InitialDelaySeconds = initialDelaySeconds;
            PeriodSeconds = periodSeconds;
            SuccessThreshold = successThreshold;
            TcpSocket = tcpSocket;
            TerminationGracePeriodSeconds = terminationGracePeriodSeconds;
            TimeoutSeconds = timeoutSeconds;
        }
    }
}