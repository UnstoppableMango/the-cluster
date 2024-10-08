// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Runtime.V1Alpha1
{

    /// <summary>
    /// NamespaceSelector decides whether to call the hook for an object based on whether the namespace for that object matches the selector. Defaults to the empty LabelSelector, which matches all objects.
    /// </summary>
    public class ExtensionConfigSpecNamespaceSelectorArgs : global::Pulumi.ResourceArgs
    {
        [Input("matchExpressions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Runtime.V1Alpha1.ExtensionConfigSpecNamespaceSelectorMatchExpressionsArgs>? _matchExpressions;

        /// <summary>
        /// matchExpressions is a list of label selector requirements. The requirements are ANDed.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Runtime.V1Alpha1.ExtensionConfigSpecNamespaceSelectorMatchExpressionsArgs> MatchExpressions
        {
            get => _matchExpressions ?? (_matchExpressions = new InputList<Pulumi.Kubernetes.Types.Inputs.Runtime.V1Alpha1.ExtensionConfigSpecNamespaceSelectorMatchExpressionsArgs>());
            set => _matchExpressions = value;
        }

        [Input("matchLabels")]
        private InputMap<string>? _matchLabels;

        /// <summary>
        /// matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.
        /// </summary>
        public InputMap<string> MatchLabels
        {
            get => _matchLabels ?? (_matchLabels = new InputMap<string>());
            set => _matchLabels = value;
        }

        public ExtensionConfigSpecNamespaceSelectorArgs()
        {
        }
        public static new ExtensionConfigSpecNamespaceSelectorArgs Empty => new ExtensionConfigSpecNamespaceSelectorArgs();
    }
}
