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
    /// VirtualServerListener references a custom http and/or https listener defined in GlobalConfiguration.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecListener
    {
        public readonly string Http;
        public readonly string Https;

        [OutputConstructor]
        private VirtualServerSpecListener(
            string http,

            string https)
        {
            Http = http;
            Https = https;
        }
    }
}
