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
    /// ErrorPageRedirect defines a redirect for an ErrorPage.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesErrorPagesRedirect
    {
        public readonly int Code;
        public readonly string Url;

        [OutputConstructor]
        private VirtualServerSpecRoutesErrorPagesRedirect(
            int code,

            string url)
        {
            Code = code;
            Url = url;
        }
    }
}
