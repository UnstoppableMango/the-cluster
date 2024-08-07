// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2
{

    [OutputType]
    public sealed class ServerSpecHardwareCompute
    {
        public readonly int ProcessorCount;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecHardwareComputeProcessors> Processors;
        public readonly int TotalCoreCount;
        public readonly int TotalThreadCount;

        [OutputConstructor]
        private ServerSpecHardwareCompute(
            int processorCount,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecHardwareComputeProcessors> processors,

            int totalCoreCount,

            int totalThreadCount)
        {
            ProcessorCount = processorCount;
            Processors = processors;
            TotalCoreCount = totalCoreCount;
            TotalThreadCount = totalThreadCount;
        }
    }
}
