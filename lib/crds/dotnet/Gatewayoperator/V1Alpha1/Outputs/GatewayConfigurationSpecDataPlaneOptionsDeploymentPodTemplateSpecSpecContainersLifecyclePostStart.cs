// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// PostStart is called immediately after a container is created. If the handler fails, the container is terminated and restarted according to its restart policy. Other management of the container blocks until the hook completes. More info: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/#container-hooks
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStart
    {
        /// <summary>
        /// Exec specifies the action to take.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStartExec Exec;
        /// <summary>
        /// HTTPGet specifies the http request to perform.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStartHttpGet HttpGet;
        /// <summary>
        /// Deprecated. TCPSocket is NOT supported as a LifecycleHandler and kept for the backward compatibility. There are no validation of this field and lifecycle hooks will fail in runtime when tcp handler is specified.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStartTcpSocket TcpSocket;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStart(
            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStartExec exec,

            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStartHttpGet httpGet,

            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecContainersLifecyclePostStartTcpSocket tcpSocket)
        {
            Exec = exec;
            HttpGet = httpGet;
            TcpSocket = tcpSocket;
        }
    }
}
