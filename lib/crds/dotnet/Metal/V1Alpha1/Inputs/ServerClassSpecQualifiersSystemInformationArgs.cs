// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Metal.V1Alpha1
{

    public class ServerClassSpecQualifiersSystemInformationArgs : global::Pulumi.ResourceArgs
    {
        [Input("family")]
        public Input<string>? Family { get; set; }

        [Input("manufacturer")]
        public Input<string>? Manufacturer { get; set; }

        [Input("productName")]
        public Input<string>? ProductName { get; set; }

        [Input("serialNumber")]
        public Input<string>? SerialNumber { get; set; }

        [Input("skuNumber")]
        public Input<string>? SkuNumber { get; set; }

        [Input("version")]
        public Input<string>? Version { get; set; }

        public ServerClassSpecQualifiersSystemInformationArgs()
        {
        }
        public static new ServerClassSpecQualifiersSystemInformationArgs Empty => new ServerClassSpecQualifiersSystemInformationArgs();
    }
}