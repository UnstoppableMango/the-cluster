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
    /// AutoscalingRunnerSetSpec defines the desired state of AutoscalingRunnerSet
    /// </summary>
    [OutputType]
    public sealed class AutoscalingRunnerSetSpec
    {
        /// <summary>
        /// Required
        /// </summary>
        public readonly string GithubConfigSecret;
        /// <summary>
        /// Required
        /// </summary>
        public readonly string GithubConfigUrl;
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecGithubServerTls GithubServerTLS;
        /// <summary>
        /// PodTemplateSpec describes the data a pod should have when created from a template
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecListenerTemplate ListenerTemplate;
        public readonly int MaxRunners;
        public readonly int MinRunners;
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecProxy Proxy;
        public readonly string RunnerGroup;
        public readonly string RunnerScaleSetName;
        /// <summary>
        /// Required
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplate Template;

        [OutputConstructor]
        private AutoscalingRunnerSetSpec(
            string githubConfigSecret,

            string githubConfigUrl,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecGithubServerTls githubServerTLS,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecListenerTemplate listenerTemplate,

            int maxRunners,

            int minRunners,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecProxy proxy,

            string runnerGroup,

            string runnerScaleSetName,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplate template)
        {
            GithubConfigSecret = githubConfigSecret;
            GithubConfigUrl = githubConfigUrl;
            GithubServerTLS = githubServerTLS;
            ListenerTemplate = listenerTemplate;
            MaxRunners = maxRunners;
            MinRunners = minRunners;
            Proxy = proxy;
            RunnerGroup = runnerGroup;
            RunnerScaleSetName = runnerScaleSetName;
            Template = template;
        }
    }
}