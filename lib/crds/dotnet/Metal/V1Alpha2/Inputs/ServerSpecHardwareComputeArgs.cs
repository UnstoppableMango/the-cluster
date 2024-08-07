// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2
{

    public class ServerSpecHardwareComputeArgs : global::Pulumi.ResourceArgs
    {
        [Input("processorCount")]
        public Input<int>? ProcessorCount { get; set; }

        [Input("processors")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerSpecHardwareComputeProcessorsArgs>? _processors;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerSpecHardwareComputeProcessorsArgs> Processors
        {
            get => _processors ?? (_processors = new InputList<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerSpecHardwareComputeProcessorsArgs>());
            set => _processors = value;
        }

        [Input("totalCoreCount")]
        public Input<int>? TotalCoreCount { get; set; }

        [Input("totalThreadCount")]
        public Input<int>? TotalThreadCount { get; set; }

        public ServerSpecHardwareComputeArgs()
        {
        }
        public static new ServerSpecHardwareComputeArgs Empty => new ServerSpecHardwareComputeArgs();
    }
}
