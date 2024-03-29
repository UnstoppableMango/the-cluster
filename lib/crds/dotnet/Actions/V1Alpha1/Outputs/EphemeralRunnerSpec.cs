// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1
{

    /// <summary>
    /// EphemeralRunnerSpec defines the desired state of EphemeralRunner
    /// </summary>
    [OutputType]
    public sealed class EphemeralRunnerSpec
    {
        public readonly string GithubConfigSecret;
        public readonly string GithubConfigUrl;
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecGithubServerTls GithubServerTLS;
        /// <summary>
        /// Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecMetadata Metadata;
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecProxy Proxy;
        public readonly string ProxySecretRef;
        public readonly int RunnerScaleSetId;
        /// <summary>
        /// Specification of the desired behavior of the pod. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpec Spec;

        [OutputConstructor]
        private EphemeralRunnerSpec(
            string githubConfigSecret,

            string githubConfigUrl,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecGithubServerTls githubServerTLS,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecMetadata metadata,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecProxy proxy,

            string proxySecretRef,

            int runnerScaleSetId,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpec spec)
        {
            GithubConfigSecret = githubConfigSecret;
            GithubConfigUrl = githubConfigUrl;
            GithubServerTLS = githubServerTLS;
            Metadata = metadata;
            Proxy = proxy;
            ProxySecretRef = proxySecretRef;
            RunnerScaleSetId = runnerScaleSetId;
            Spec = spec;
        }
    }
}
