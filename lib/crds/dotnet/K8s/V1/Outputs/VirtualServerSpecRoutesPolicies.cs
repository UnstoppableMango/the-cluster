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
    /// PolicyReference references a policy by name and an optional namespace.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesPolicies
    {
        public readonly string Name;
        public readonly string Namespace;

        [OutputConstructor]
        private VirtualServerSpecRoutesPolicies(
            string name,

            string @namespace)
        {
            Name = name;
            Namespace = @namespace;
        }
    }
}