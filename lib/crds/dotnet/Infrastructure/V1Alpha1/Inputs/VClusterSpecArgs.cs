// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha1
{

    /// <summary>
    /// VClusterSpec defines the desired state of VCluster
    /// </summary>
    public class VClusterSpecArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
        /// </summary>
        [Input("controlPlaneEndpoint")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha1.VClusterSpecControlPlaneEndpointArgs>? ControlPlaneEndpoint { get; set; }

        /// <summary>
        /// The helm release configuration for the virtual cluster. This is optional, but when filled, specified chart will be deployed.
        /// </summary>
        [Input("helmRelease")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha1.VClusterSpecHelmReleaseArgs>? HelmRelease { get; set; }

        /// <summary>
        /// Kubernetes version that should be used in this vcluster instance, e.g. "1.23". Versions out of the supported range will be ignored, and earliest/latest supported version will be used instead.
        /// </summary>
        [Input("kubernetesVersion")]
        public Input<string>? KubernetesVersion { get; set; }

        public VClusterSpecArgs()
        {
        }
        public static new VClusterSpecArgs Empty => new VClusterSpecArgs();
    }
}