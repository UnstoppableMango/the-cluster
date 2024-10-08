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
    /// Secret is a reference to a Secrets's `data` key, in the trust Namespace.
    /// </summary>
    [OutputType]
    public sealed class BundleSpecSourcesSecret
    {
        /// <summary>
        /// Key is the key of the entry in the object's `data` field to be used.
        /// </summary>
        public readonly string Key;
        /// <summary>
        /// Name is the name of the source object in the trust Namespace.
        /// </summary>
        public readonly string Name;

        [OutputConstructor]
        private BundleSpecSourcesSecret(
            string key,

            string name)
        {
            Key = key;
            Name = name;
        }
    }
}
