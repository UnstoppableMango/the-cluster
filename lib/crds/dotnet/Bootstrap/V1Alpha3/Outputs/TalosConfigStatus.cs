// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Bootstrap.V1Alpha3
{

    /// <summary>
    /// TalosConfigStatus defines the observed state of TalosConfig
    /// </summary>
    [OutputType]
    public sealed class TalosConfigStatus
    {
        /// <summary>
        /// Conditions defines current service state of the TalosConfig.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Bootstrap.V1Alpha3.TalosConfigStatusConditions> Conditions;
        /// <summary>
        /// DataSecretName is the name of the secret that stores the bootstrap data script.
        /// </summary>
        public readonly string DataSecretName;
        /// <summary>
        /// FailureMessage will be set on non-retryable errors
        /// </summary>
        public readonly string FailureMessage;
        /// <summary>
        /// FailureReason will be set on non-retryable errors
        /// </summary>
        public readonly string FailureReason;
        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        public readonly int ObservedGeneration;
        /// <summary>
        /// Ready indicates the BootstrapData field is ready to be consumed
        /// </summary>
        public readonly bool Ready;
        /// <summary>
        /// Talos config will be a string containing the config for download. 
        ///  Deprecated: please use `&lt;cluster&gt;-talosconfig` secret.
        /// </summary>
        public readonly string TalosConfig;

        [OutputConstructor]
        private TalosConfigStatus(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Bootstrap.V1Alpha3.TalosConfigStatusConditions> conditions,

            string dataSecretName,

            string failureMessage,

            string failureReason,

            int observedGeneration,

            bool ready,

            string talosConfig)
        {
            Conditions = conditions;
            DataSecretName = dataSecretName;
            FailureMessage = failureMessage;
            FailureReason = failureReason;
            ObservedGeneration = observedGeneration;
            Ready = ready;
            TalosConfig = talosConfig;
        }
    }
}
