// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Pulumi.V1
{

    /// <summary>
    /// LiteralRef refers to a literal value
    /// </summary>
    public class StackSpecGitAuthSshAuthPasswordLiteralArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Value to load
        /// </summary>
        [Input("value", required: true)]
        public Input<string> Value { get; set; } = null!;

        public StackSpecGitAuthSshAuthPasswordLiteralArgs()
        {
        }
        public static new StackSpecGitAuthSshAuthPasswordLiteralArgs Empty => new StackSpecGitAuthSshAuthPasswordLiteralArgs();
    }
}
