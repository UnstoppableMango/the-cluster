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
    /// RateLimit defines a rate limit policy.
    /// </summary>
    [OutputType]
    public sealed class PolicySpecRateLimit
    {
        public readonly int Burst;
        public readonly int Delay;
        public readonly bool DryRun;
        public readonly string Key;
        public readonly string LogLevel;
        public readonly bool NoDelay;
        public readonly string Rate;
        public readonly int RejectCode;
        public readonly string ZoneSize;

        [OutputConstructor]
        private PolicySpecRateLimit(
            int burst,

            int delay,

            bool dryRun,

            string key,

            string logLevel,

            bool noDelay,

            string rate,

            int rejectCode,

            string zoneSize)
        {
            Burst = burst;
            Delay = delay;
            DryRun = dryRun;
            Key = key;
            LogLevel = logLevel;
            NoDelay = noDelay;
            Rate = rate;
            RejectCode = rejectCode;
            ZoneSize = zoneSize;
        }
    }
}
