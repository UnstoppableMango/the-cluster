// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.K8s.V1Alpha1
{

    /// <summary>
    /// IngressMTLS defines an Ingress MTLS policy.
    /// </summary>
    public class PolicySpecIngressMtlsArgs : global::Pulumi.ResourceArgs
    {
        [Input("clientCertSecret")]
        public Input<string>? ClientCertSecret { get; set; }

        [Input("verifyClient")]
        public Input<string>? VerifyClient { get; set; }

        [Input("verifyDepth")]
        public Input<int>? VerifyDepth { get; set; }

        public PolicySpecIngressMtlsArgs()
        {
        }
        public static new PolicySpecIngressMtlsArgs Empty => new PolicySpecIngressMtlsArgs();
    }
}