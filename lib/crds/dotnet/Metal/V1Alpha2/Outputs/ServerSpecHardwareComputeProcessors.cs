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
    public sealed class ServerSpecHardwareComputeProcessors
    {
        public readonly int CoreCount;
        public readonly string Manufacturer;
        public readonly string ProductName;
        public readonly string SerialNumber;
        /// <summary>
        /// Speed is in megahertz (Mhz)
        /// </summary>
        public readonly int Speed;
        public readonly int ThreadCount;

        [OutputConstructor]
        private ServerSpecHardwareComputeProcessors(
            int coreCount,

            string manufacturer,

            string productName,

            string serialNumber,

            int speed,

            int threadCount)
        {
            CoreCount = coreCount;
            Manufacturer = manufacturer;
            ProductName = productName;
            SerialNumber = serialNumber;
            Speed = speed;
            ThreadCount = threadCount;
        }
    }
}
