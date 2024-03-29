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
    /// Desired state of the Bundle resource.
    /// </summary>
    [OutputType]
    public sealed class BundleSpec
    {
        /// <summary>
        /// Sources is a set of references to data whose data will sync to the target.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Trust.V1Alpha1.BundleSpecSources> Sources;
        /// <summary>
        /// Target is the target location in all namespaces to sync source data to.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Trust.V1Alpha1.BundleSpecTarget Target;

        [OutputConstructor]
        private BundleSpec(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Trust.V1Alpha1.BundleSpecSources> sources,

            Pulumi.Kubernetes.Types.Outputs.Trust.V1Alpha1.BundleSpecTarget target)
        {
            Sources = sources;
            Target = target;
        }
    }
}
