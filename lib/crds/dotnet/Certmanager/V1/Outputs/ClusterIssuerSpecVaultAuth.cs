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
    /// Auth configures how cert-manager authenticates with the Vault server.
    /// </summary>
    [OutputType]
    public sealed class ClusterIssuerSpecVaultAuth
    {
        /// <summary>
        /// AppRole authenticates with Vault using the App Role auth mechanism, with the role and secret stored in a Kubernetes Secret resource.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVaultAuthAppRole AppRole;
        /// <summary>
        /// Kubernetes authenticates with Vault by passing the ServiceAccount token stored in the named Secret resource to the Vault server.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVaultAuthKubernetes Kubernetes;
        /// <summary>
        /// TokenSecretRef authenticates with Vault by presenting a token.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVaultAuthTokenSecretRef TokenSecretRef;

        [OutputConstructor]
        private ClusterIssuerSpecVaultAuth(
            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVaultAuthAppRole appRole,

            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVaultAuthKubernetes kubernetes,

            Pulumi.Kubernetes.Types.Outputs.Certmanager.V1.ClusterIssuerSpecVaultAuthTokenSecretRef tokenSecretRef)
        {
            AppRole = appRole;
            Kubernetes = kubernetes;
            TokenSecretRef = tokenSecretRef;
        }
    }
}
