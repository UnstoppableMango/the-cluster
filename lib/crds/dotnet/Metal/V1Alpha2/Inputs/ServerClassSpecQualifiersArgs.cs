// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2
{

    /// <summary>
    /// Qualifiers to match on the server spec. 
    ///  If qualifiers are empty, they match all servers. Server should match both qualifiers and selector conditions to be included into the server class.
    /// </summary>
    public class ServerClassSpecQualifiersArgs : global::Pulumi.ResourceArgs
    {
        [Input("hardware")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareArgs>? _hardware;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareArgs> Hardware
        {
            get => _hardware ?? (_hardware = new InputList<Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha2.ServerClassSpecQualifiersHardwareArgs>());
            set => _hardware = value;
        }

        [Input("labelSelectors")]
        private InputList<ImmutableDictionary<string, string>>? _labelSelectors;
        public InputList<ImmutableDictionary<string, string>> LabelSelectors
        {
            get => _labelSelectors ?? (_labelSelectors = new InputList<ImmutableDictionary<string, string>>());
            set => _labelSelectors = value;
        }

        public ServerClassSpecQualifiersArgs()
        {
        }
        public static new ServerClassSpecQualifiersArgs Empty => new ServerClassSpecQualifiersArgs();
    }
}