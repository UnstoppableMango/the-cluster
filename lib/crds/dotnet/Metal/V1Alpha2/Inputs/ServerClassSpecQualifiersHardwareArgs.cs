// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2
{

    public class ServerClassSpecQualifiersHardwareArgs : global::Pulumi.ResourceArgs
    {
        [Input("compute")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareComputeArgs>? Compute { get; set; }

        [Input("memory")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareMemoryArgs>? Memory { get; set; }

        [Input("network")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareNetworkArgs>? Network { get; set; }

        [Input("storage")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareStorageArgs>? Storage { get; set; }

        [Input("system")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareSystemArgs>? System { get; set; }

        public ServerClassSpecQualifiersHardwareArgs()
        {
        }
        public static new ServerClassSpecQualifiersHardwareArgs Empty => new ServerClassSpecQualifiersHardwareArgs();
    }
}