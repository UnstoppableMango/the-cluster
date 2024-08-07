// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha1
{

    /// <summary>
    /// ServerClassStatus defines the observed state of ServerClass.
    /// </summary>
    public class ServerClassStatusArgs : global::Pulumi.ResourceArgs
    {
        [Input("serversAvailable", required: true)]
        private InputList<string>? _serversAvailable;
        public InputList<string> ServersAvailable
        {
            get => _serversAvailable ?? (_serversAvailable = new InputList<string>());
            set => _serversAvailable = value;
        }

        [Input("serversInUse", required: true)]
        private InputList<string>? _serversInUse;
        public InputList<string> ServersInUse
        {
            get => _serversInUse ?? (_serversInUse = new InputList<string>());
            set => _serversInUse = value;
        }

        public ServerClassStatusArgs()
        {
        }
        public static new ServerClassStatusArgs Empty => new ServerClassStatusArgs();
    }
}
