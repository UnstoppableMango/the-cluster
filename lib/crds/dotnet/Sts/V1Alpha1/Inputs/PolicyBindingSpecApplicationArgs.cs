// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Sts.V1Alpha1
{

    public class PolicyBindingSpecApplicationArgs : global::Pulumi.ResourceArgs
    {
        [Input("namespace", required: true)]
        public Input<string> Namespace { get; set; } = null!;

        [Input("serviceaccount", required: true)]
        public Input<string> Serviceaccount { get; set; } = null!;

        public PolicyBindingSpecApplicationArgs()
        {
        }
        public static new PolicyBindingSpecApplicationArgs Empty => new PolicyBindingSpecApplicationArgs();
    }
}
