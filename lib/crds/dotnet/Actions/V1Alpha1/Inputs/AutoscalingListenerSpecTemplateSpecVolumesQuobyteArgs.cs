// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1
{

    /// <summary>
    /// quobyte represents a Quobyte mount on the host that shares a pod's lifetime
    /// </summary>
    public class AutoscalingListenerSpecTemplateSpecVolumesQuobyteArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// group to map volume access to Default is no group
        /// </summary>
        [Input("group")]
        public Input<string>? Group { get; set; }

        /// <summary>
        /// readOnly here will force the Quobyte volume to be mounted with read-only permissions. Defaults to false.
        /// </summary>
        [Input("readOnly")]
        public Input<bool>? ReadOnly { get; set; }

        /// <summary>
        /// registry represents a single or multiple Quobyte Registry services specified as a string as host:port pair (multiple entries are separated with commas) which acts as the central registry for volumes
        /// </summary>
        [Input("registry", required: true)]
        public Input<string> Registry { get; set; } = null!;

        /// <summary>
        /// tenant owning the given Quobyte volume in the Backend Used with dynamically provisioned Quobyte volumes, value is set by the plugin
        /// </summary>
        [Input("tenant")]
        public Input<string>? Tenant { get; set; }

        /// <summary>
        /// user to map volume access to Defaults to serivceaccount user
        /// </summary>
        [Input("user")]
        public Input<string>? User { get; set; }

        /// <summary>
        /// volume is a string that references an already created Quobyte volume by name.
        /// </summary>
        [Input("volume", required: true)]
        public Input<string> Volume { get; set; } = null!;

        public AutoscalingListenerSpecTemplateSpecVolumesQuobyteArgs()
        {
        }
        public static new AutoscalingListenerSpecTemplateSpecVolumesQuobyteArgs Empty => new AutoscalingListenerSpecTemplateSpecVolumesQuobyteArgs();
    }
}