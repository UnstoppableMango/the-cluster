// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1
{

    /// <summary>
    /// LiteralRef refers to a literal value
    /// </summary>
    public class StackSpecSecretsRefLiteralArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Value to load
        /// </summary>
        [Input("value", required: true)]
        public Input<string> Value { get; set; } = null!;

        public StackSpecSecretsRefLiteralArgs()
        {
        }
        public static new StackSpecSecretsRefLiteralArgs Empty => new StackSpecSecretsRefLiteralArgs();
    }
}
