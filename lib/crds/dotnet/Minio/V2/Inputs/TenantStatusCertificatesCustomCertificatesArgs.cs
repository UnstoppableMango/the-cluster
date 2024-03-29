// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantStatusCertificatesCustomCertificatesArgs : global::Pulumi.ResourceArgs
    {
        [Input("client")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesClientArgs>? _client;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesClientArgs> Client
        {
            get => _client ?? (_client = new InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesClientArgs>());
            set => _client = value;
        }

        [Input("minio")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesMinioArgs>? _minio;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesMinioArgs> Minio
        {
            get => _minio ?? (_minio = new InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesMinioArgs>());
            set => _minio = value;
        }

        [Input("minioCAs")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesMinioCasArgs>? _minioCAs;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesMinioCasArgs> MinioCAs
        {
            get => _minioCAs ?? (_minioCAs = new InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantStatusCertificatesCustomCertificatesMinioCasArgs>());
            set => _minioCAs = value;
        }

        public TenantStatusCertificatesCustomCertificatesArgs()
        {
        }
        public static new TenantStatusCertificatesCustomCertificatesArgs Empty => new TenantStatusCertificatesCustomCertificatesArgs();
    }
}
