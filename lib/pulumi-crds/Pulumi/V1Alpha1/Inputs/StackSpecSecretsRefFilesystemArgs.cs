// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Pulumi.V1Alpha1
{

    /// <summary>
    /// FileSystem selects a file on the operator's file system
    /// </summary>
    public class StackSpecSecretsRefFilesystemArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Path on the filesystem to use to load information from.
        /// </summary>
        [Input("path", required: true)]
        public Input<string> Path { get; set; } = null!;

        public StackSpecSecretsRefFilesystemArgs()
        {
        }
        public static new StackSpecSecretsRefFilesystemArgs Empty => new StackSpecSecretsRefFilesystemArgs();
    }
}
