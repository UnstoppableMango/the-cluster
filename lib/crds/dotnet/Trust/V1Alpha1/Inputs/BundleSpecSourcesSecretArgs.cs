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
    /// Secret is a reference to a Secrets's `data` key, in the trust Namespace.
    /// </summary>
    public class BundleSpecSourcesSecretArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Key is the key of the entry in the object's `data` field to be used.
        /// </summary>
        [Input("key", required: true)]
        public Input<string> Key { get; set; } = null!;

        /// <summary>
        /// Name is the name of the source object in the trust Namespace.
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        public BundleSpecSourcesSecretArgs()
        {
        }
        public static new BundleSpecSourcesSecretArgs Empty => new BundleSpecSourcesSecretArgs();
    }
}