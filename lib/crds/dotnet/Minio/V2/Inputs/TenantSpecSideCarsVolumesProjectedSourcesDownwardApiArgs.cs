// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecSideCarsVolumesProjectedSourcesDownwardApiArgs : global::Pulumi.ResourceArgs
    {
        [Input("items")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesProjectedSourcesDownwardApiItemsArgs>? _items;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesProjectedSourcesDownwardApiItemsArgs> Items
        {
            get => _items ?? (_items = new InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesProjectedSourcesDownwardApiItemsArgs>());
            set => _items = value;
        }

        public TenantSpecSideCarsVolumesProjectedSourcesDownwardApiArgs()
        {
        }
        public static new TenantSpecSideCarsVolumesProjectedSourcesDownwardApiArgs Empty => new TenantSpecSideCarsVolumesProjectedSourcesDownwardApiArgs();
    }
}