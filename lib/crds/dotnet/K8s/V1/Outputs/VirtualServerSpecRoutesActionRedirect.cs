// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.K8s.V1
{

    /// <summary>
    /// ActionRedirect defines a redirect in an Action.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesActionRedirect
    {
        public readonly int Code;
        public readonly string Url;

        [OutputConstructor]
        private VirtualServerSpecRoutesActionRedirect(
            int code,

            string url)
        {
            Code = code;
            Url = url;
        }
    }
}