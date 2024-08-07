// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Trust.V1Alpha1
{

    /// <summary>
    /// Secret is the target Secret that all Bundle source data will be synced to. Using Secrets as targets is only supported if enabled at trust-manager startup. By default, trust-manager has no permissions for writing to secrets and can only read secrets in the trust namespace.
    /// </summary>
    public class BundleSpecTargetSecretArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Key is the key of the entry in the object's `data` field to be used.
        /// </summary>
        [Input("key", required: true)]
        public Input<string> Key { get; set; } = null!;

        public BundleSpecTargetSecretArgs()
        {
        }
        public static new BundleSpecTargetSecretArgs Empty => new BundleSpecTargetSecretArgs();
    }
}
