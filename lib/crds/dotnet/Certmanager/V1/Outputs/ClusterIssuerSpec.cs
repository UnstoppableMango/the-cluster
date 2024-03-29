// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Certmanager.V1
{

    /// <summary>
    /// Desired state of the ClusterIssuer resource.
    /// </summary>
    [OutputType]
    public sealed class ClusterIssuerSpec
    {
        /// <summary>
        /// ACME configures this issuer to communicate with a RFC8555 (ACME) server to obtain signed x509 certificates.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecAcme Acme;
        /// <summary>
        /// CA configures this issuer to sign certificates using a signing CA keypair stored in a Secret resource. This is used to build internal PKIs that are managed by cert-manager.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecCa Ca;
        /// <summary>
        /// SelfSigned configures this issuer to 'self sign' certificates using the private key used to create the CertificateRequest object.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecSelfSigned SelfSigned;
        /// <summary>
        /// Vault configures this issuer to sign certificates using a HashiCorp Vault PKI backend.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVault Vault;
        /// <summary>
        /// Venafi configures this issuer to sign certificates using a Venafi TPP or Venafi Cloud policy zone.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVenafi Venafi;

        [OutputConstructor]
        private ClusterIssuerSpec(
            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecAcme acme,

            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecCa ca,

            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecSelfSigned selfSigned,

            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVault vault,

            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVenafi venafi)
        {
            Acme = acme;
            Ca = ca;
            SelfSigned = selfSigned;
            Vault = vault;
            Venafi = venafi;
        }
    }
}
