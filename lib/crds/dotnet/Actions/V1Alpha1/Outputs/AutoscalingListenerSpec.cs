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
    /// AutoscalingListenerSpec defines the desired state of AutoscalingListener
    /// </summary>
    [OutputType]
    public sealed class AutoscalingListenerSpec
    {
        /// <summary>
        /// Required
        /// </summary>
        public readonly string AutoscalingRunnerSetName;
        /// <summary>
        /// Required
        /// </summary>
        public readonly string AutoscalingRunnerSetNamespace;
        /// <summary>
        /// Required
        /// </summary>
        public readonly string EphemeralRunnerSetName;
        /// <summary>
        /// Required
        /// </summary>
        public readonly string GithubConfigSecret;
        /// <summary>
        /// Required
        /// </summary>
        public readonly string GithubConfigUrl;
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecGithubServerTls GithubServerTLS;
        /// <summary>
        /// Required
        /// </summary>
        public readonly string Image;
        /// <summary>
        /// Required
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecImagePullSecrets> ImagePullSecrets;
        /// <summary>
        /// Required
        /// </summary>
        public readonly int MaxRunners;
        /// <summary>
        /// Required
        /// </summary>
        public readonly int MinRunners;
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecProxy Proxy;
        /// <summary>
        /// Required
        /// </summary>
        public readonly int RunnerScaleSetId;
        /// <summary>
        /// PodTemplateSpec describes the data a pod should have when created from a template
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplate Template;

        [OutputConstructor]
        private AutoscalingListenerSpec(
            string autoscalingRunnerSetName,

            string autoscalingRunnerSetNamespace,

            string ephemeralRunnerSetName,

            string githubConfigSecret,

            string githubConfigUrl,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecGithubServerTls githubServerTLS,

            string image,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecImagePullSecrets> imagePullSecrets,

            int maxRunners,

            int minRunners,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecProxy proxy,

            int runnerScaleSetId,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplate template)
        {
            AutoscalingRunnerSetName = autoscalingRunnerSetName;
            AutoscalingRunnerSetNamespace = autoscalingRunnerSetNamespace;
            EphemeralRunnerSetName = ephemeralRunnerSetName;
            GithubConfigSecret = githubConfigSecret;
            GithubConfigUrl = githubConfigUrl;
            GithubServerTLS = githubServerTLS;
            Image = image;
            ImagePullSecrets = imagePullSecrets;
            MaxRunners = maxRunners;
            MinRunners = minRunners;
            Proxy = proxy;
            RunnerScaleSetId = runnerScaleSetId;
            Template = template;
        }
    }
}