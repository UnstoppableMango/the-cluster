// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1
{

    /// <summary>
    /// EphemeralRunnerSpec defines the desired state of EphemeralRunner
    /// </summary>
    public class EphemeralRunnerSpecArgs : global::Pulumi.ResourceArgs
    {
        [Input("githubConfigSecret")]
        public Input<string>? GithubConfigSecret { get; set; }

        [Input("githubConfigUrl")]
        public Input<string>? GithubConfigUrl { get; set; }

        [Input("githubServerTLS")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSpecGithubServerTlsArgs>? GithubServerTLS { get; set; }

        /// <summary>
        /// Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
        /// </summary>
        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSpecMetadataArgs>? Metadata { get; set; }

        [Input("proxy")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSpecProxyArgs>? Proxy { get; set; }

        [Input("proxySecretRef")]
        public Input<string>? ProxySecretRef { get; set; }

        [Input("runnerScaleSetId")]
        public Input<int>? RunnerScaleSetId { get; set; }

        /// <summary>
        /// Specification of the desired behavior of the pod. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecArgs>? Spec { get; set; }

        public EphemeralRunnerSpecArgs()
        {
        }
        public static new EphemeralRunnerSpecArgs Empty => new EphemeralRunnerSpecArgs();
    }
}