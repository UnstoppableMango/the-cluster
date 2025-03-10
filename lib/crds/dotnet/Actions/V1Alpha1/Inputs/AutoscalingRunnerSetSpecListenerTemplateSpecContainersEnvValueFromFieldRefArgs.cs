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
    /// Selects a field of the pod: supports metadata.name, metadata.namespace, `metadata.labels['&lt;KEY&gt;']`, `metadata.annotations['&lt;KEY&gt;']`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs.
    /// </summary>
    public class AutoscalingRunnerSetSpecListenerTemplateSpecContainersEnvValueFromFieldRefArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Version of the schema the FieldPath is written in terms of, defaults to "v1".
        /// </summary>
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        /// <summary>
        /// Path of the field to select in the specified API version.
        /// </summary>
        [Input("fieldPath", required: true)]
        public Input<string> FieldPath { get; set; } = null!;

        public AutoscalingRunnerSetSpecListenerTemplateSpecContainersEnvValueFromFieldRefArgs()
        {
        }
        public static new AutoscalingRunnerSetSpecListenerTemplateSpecContainersEnvValueFromFieldRefArgs Empty => new AutoscalingRunnerSetSpecListenerTemplateSpecContainersEnvValueFromFieldRefArgs();
    }
}
