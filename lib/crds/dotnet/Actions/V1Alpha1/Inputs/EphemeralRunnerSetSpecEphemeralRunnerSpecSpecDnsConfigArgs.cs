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
    /// Specifies the DNS parameters of a pod. Parameters specified here will be merged to the generated DNS configuration based on DNSPolicy.
    /// </summary>
    public class EphemeralRunnerSetSpecEphemeralRunnerSpecSpecDnsConfigArgs : global::Pulumi.ResourceArgs
    {
        [Input("nameservers")]
        private InputList<string>? _nameservers;

        /// <summary>
        /// A list of DNS name server IP addresses. This will be appended to the base nameservers generated from DNSPolicy. Duplicated nameservers will be removed.
        /// </summary>
        public InputList<string> Nameservers
        {
            get => _nameservers ?? (_nameservers = new InputList<string>());
            set => _nameservers = value;
        }

        [Input("options")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecDnsConfigOptionsArgs>? _options;

        /// <summary>
        /// A list of DNS resolver options. This will be merged with the base options generated from DNSPolicy. Duplicated entries will be removed. Resolution options given in Options will override those that appear in the base DNSPolicy.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecDnsConfigOptionsArgs> Options
        {
            get => _options ?? (_options = new InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecDnsConfigOptionsArgs>());
            set => _options = value;
        }

        [Input("searches")]
        private InputList<string>? _searches;

        /// <summary>
        /// A list of DNS search domains for host-name lookup. This will be appended to the base search paths generated from DNSPolicy. Duplicated search paths will be removed.
        /// </summary>
        public InputList<string> Searches
        {
            get => _searches ?? (_searches = new InputList<string>());
            set => _searches = value;
        }

        public EphemeralRunnerSetSpecEphemeralRunnerSpecSpecDnsConfigArgs()
        {
        }
        public static new EphemeralRunnerSetSpecEphemeralRunnerSpecSpecDnsConfigArgs Empty => new EphemeralRunnerSetSpecEphemeralRunnerSpecSpecDnsConfigArgs();
    }
}
