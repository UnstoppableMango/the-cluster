// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecSideCarsVolumesProjectedSourcesArgs : global::Pulumi.ResourceArgs
    {
        [Input("configMap")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesProjectedSourcesConfigMapArgs>? ConfigMap { get; set; }

        [Input("downwardAPI")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesProjectedSourcesDownwardApiArgs>? DownwardAPI { get; set; }

        [Input("secret")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesProjectedSourcesSecretArgs>? Secret { get; set; }

        [Input("serviceAccountToken")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesProjectedSourcesServiceAccountTokenArgs>? ServiceAccountToken { get; set; }

        public TenantSpecSideCarsVolumesProjectedSourcesArgs()
        {
        }
        public static new TenantSpecSideCarsVolumesProjectedSourcesArgs Empty => new TenantSpecSideCarsVolumesProjectedSourcesArgs();
    }
}
