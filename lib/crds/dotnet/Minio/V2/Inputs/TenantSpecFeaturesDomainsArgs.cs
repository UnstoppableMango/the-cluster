// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecFeaturesDomainsArgs : global::Pulumi.ResourceArgs
    {
        [Input("console")]
        public Input<string>? Console { get; set; }

        [Input("minio")]
        private InputList<string>? _minio;
        public InputList<string> Minio
        {
            get => _minio ?? (_minio = new InputList<string>());
            set => _minio = value;
        }

        public TenantSpecFeaturesDomainsArgs()
        {
        }
        public static new TenantSpecFeaturesDomainsArgs Empty => new TenantSpecFeaturesDomainsArgs();
    }
}