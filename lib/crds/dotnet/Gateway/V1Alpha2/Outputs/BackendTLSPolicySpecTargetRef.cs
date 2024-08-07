// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gateway.V1Alpha2
{

    /// <summary>
    /// TargetRef identifies an API object to apply the policy to. Only Services have Extended support. Implementations MAY support additional objects, with Implementation Specific support. Note that this config applies to the entire referenced resource by default, but this default may change in the future to provide a more granular application of the policy. 
    ///  Support: Extended for Kubernetes Service 
    ///  Support: Implementation-specific for any other resource
    /// </summary>
    [OutputType]
    public sealed class BackendTLSPolicySpecTargetRef
    {
        /// <summary>
        /// Group is the group of the target resource.
        /// </summary>
        public readonly string Group;
        /// <summary>
        /// Kind is kind of the target resource.
        /// </summary>
        public readonly string Kind;
        /// <summary>
        /// Name is the name of the target resource.
        /// </summary>
        public readonly string Name;
        /// <summary>
        /// Namespace is the namespace of the referent. When unspecified, the local namespace is inferred. Even when policy targets a resource in a different namespace, it MUST only apply to traffic originating from the same namespace as the policy.
        /// </summary>
        public readonly string Namespace;
        /// <summary>
        /// SectionName is the name of a section within the target resource. When unspecified, this targetRef targets the entire resource. In the following resources, SectionName is interpreted as the following: 
        ///  * Gateway: Listener Name * Service: Port Name 
        ///  If a SectionName is specified, but does not exist on the targeted object, the Policy must fail to attach, and the policy implementation should record a `ResolvedRefs` or similar Condition in the Policy's status.
        /// </summary>
        public readonly string SectionName;

        [OutputConstructor]
        private BackendTLSPolicySpecTargetRef(
            string group,

            string kind,

            string name,

            string @namespace,

            string sectionName)
        {
            Group = group;
            Kind = kind;
            Name = name;
            Namespace = @namespace;
            SectionName = sectionName;
        }
    }
}
