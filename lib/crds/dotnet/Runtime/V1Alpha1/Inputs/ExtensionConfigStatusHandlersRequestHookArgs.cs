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
    /// RequestHook defines the versioned runtime hook which this ExtensionHandler serves.
    /// </summary>
    public class ExtensionConfigStatusHandlersRequestHookArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// APIVersion is the group and version of the Hook.
        /// </summary>
        [Input("apiVersion", required: true)]
        public Input<string> ApiVersion { get; set; } = null!;

        /// <summary>
        /// Hook is the name of the hook.
        /// </summary>
        [Input("hook", required: true)]
        public Input<string> Hook { get; set; } = null!;

        public ExtensionConfigStatusHandlersRequestHookArgs()
        {
        }
        public static new ExtensionConfigStatusHandlersRequestHookArgs Empty => new ExtensionConfigStatusHandlersRequestHookArgs();
    }
}
