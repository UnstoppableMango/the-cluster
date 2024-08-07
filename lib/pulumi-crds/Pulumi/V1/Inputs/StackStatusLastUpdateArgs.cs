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
    /// LastUpdate contains details of the status of the last update.
    /// </summary>
    public class StackStatusLastUpdateArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Last commit attempted
        /// </summary>
        [Input("lastAttemptedCommit")]
        public Input<string>? LastAttemptedCommit { get; set; }

        /// <summary>
        /// LastResyncTime contains a timestamp for the last time a resync of the stack took place.
        /// </summary>
        [Input("lastResyncTime")]
        public Input<string>? LastResyncTime { get; set; }

        /// <summary>
        /// Last commit successfully applied
        /// </summary>
        [Input("lastSuccessfulCommit")]
        public Input<string>? LastSuccessfulCommit { get; set; }

        /// <summary>
        /// Permalink is the Pulumi Console URL of the stack operation.
        /// </summary>
        [Input("permalink")]
        public Input<string>? Permalink { get; set; }

        /// <summary>
        /// State is the state of the stack update - one of `succeeded` or `failed`
        /// </summary>
        [Input("state")]
        public Input<string>? State { get; set; }

        public StackStatusLastUpdateArgs()
        {
        }
        public static new StackStatusLastUpdateArgs Empty => new StackStatusLastUpdateArgs();
    }
}
