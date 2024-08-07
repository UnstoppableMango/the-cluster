// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Runtime.V1Alpha1
{

    /// <summary>
    /// ExtensionHandler specifies the details of a handler for a particular runtime hook registered by an Extension server.
    /// </summary>
    public class ExtensionConfigStatusHandlersArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// FailurePolicy defines how failures in calls to the ExtensionHandler should be handled by a client. Defaults to Fail if not set.
        /// </summary>
        [Input("failurePolicy")]
        public Input<string>? FailurePolicy { get; set; }

        /// <summary>
        /// Name is the unique name of the ExtensionHandler.
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        /// <summary>
        /// RequestHook defines the versioned runtime hook which this ExtensionHandler serves.
        /// </summary>
        [Input("requestHook", required: true)]
        public Input<Pulumi.Kubernetes.Types.Inputs.Runtime.V1Alpha1.ExtensionConfigStatusHandlersRequestHookArgs> RequestHook { get; set; } = null!;

        /// <summary>
        /// TimeoutSeconds defines the timeout duration for client calls to the ExtensionHandler. Defaults to 10 is not set.
        /// </summary>
        [Input("timeoutSeconds")]
        public Input<int>? TimeoutSeconds { get; set; }

        public ExtensionConfigStatusHandlersArgs()
        {
        }
        public static new ExtensionConfigStatusHandlersArgs Empty => new ExtensionConfigStatusHandlersArgs();
    }
}
