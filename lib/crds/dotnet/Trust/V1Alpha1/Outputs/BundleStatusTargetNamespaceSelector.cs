// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Trust.V1Alpha1
{

    /// <summary>
    /// NamespaceSelector will, if set, only sync the target resource in Namespaces which match the selector.
    /// </summary>
    [OutputType]
    public sealed class BundleStatusTargetNamespaceSelector
    {
        /// <summary>
        /// MatchLabels matches on the set of labels that must be present on a Namespace for the Bundle target to be synced there.
        /// </summary>
        public readonly ImmutableDictionary<string, string> MatchLabels;

        [OutputConstructor]
        private BundleStatusTargetNamespaceSelector(ImmutableDictionary<string, string> matchLabels)
        {
            MatchLabels = matchLabels;
        }
    }
}