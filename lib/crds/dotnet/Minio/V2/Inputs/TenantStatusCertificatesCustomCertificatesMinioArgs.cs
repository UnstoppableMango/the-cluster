// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantStatusCertificatesCustomCertificatesMinioArgs : global::Pulumi.ResourceArgs
    {
        [Input("certName")]
        public Input<string>? CertName { get; set; }

        [Input("domains")]
        private InputList<string>? _domains;
        public InputList<string> Domains
        {
            get => _domains ?? (_domains = new InputList<string>());
            set => _domains = value;
        }

        [Input("expiresIn")]
        public Input<string>? ExpiresIn { get; set; }

        [Input("expiry")]
        public Input<string>? Expiry { get; set; }

        [Input("serialNo")]
        public Input<string>? SerialNo { get; set; }

        public TenantStatusCertificatesCustomCertificatesMinioArgs()
        {
        }
        public static new TenantStatusCertificatesCustomCertificatesMinioArgs Empty => new TenantStatusCertificatesCustomCertificatesMinioArgs();
    }
}