// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Networking.V1Alpha1
{

    [OutputType]
    public sealed class TunnelBindingSubjectsSpec
    {
        /// <summary>
        /// CaPool trusts the CA certificate referenced by the key in the secret specified in tunnel.spec.originCaPool. tls.crt is trusted globally and does not need to be specified. Only useful if the protocol is HTTPS.
        /// </summary>
        public readonly string CaPool;
        /// <summary>
        /// Fqdn specifies the DNS name to access this service from. Defaults to the service.metadata.name + tunnel.spec.domain. If specifying this, make sure to use the same domain that the tunnel belongs to. This is not validated and used as provided
        /// </summary>
        public readonly string Fqdn;
        /// <summary>
        /// NoTlsVerify sisables TLS verification for this service. Only useful if the protocol is HTTPS.
        /// </summary>
        public readonly bool NoTlsVerify;
        /// <summary>
        /// Protocol specifies the protocol for the service. Should be one of http, https, tcp, udp, ssh or rdp. Defaults to http, with the exceptions of https for 443, smb for 139 and 445, rdp for 3389 and ssh for 22 if the service has a TCP port. The only available option for a UDP port is udp, which is default.
        /// </summary>
        public readonly string Protocol;
        /// <summary>
        /// Target specified where the tunnel should proxy to. Defaults to the form of &lt;protocol&gt;://&lt;service.metadata.name&gt;.&lt;service.metadata.namespace&gt;.svc:&lt;port&gt;
        /// </summary>
        public readonly string Target;

        [OutputConstructor]
        private TunnelBindingSubjectsSpec(
            string caPool,

            string fqdn,

            bool noTlsVerify,

            string protocol,

            string target)
        {
            CaPool = caPool;
            Fqdn = fqdn;
            NoTlsVerify = noTlsVerify;
            Protocol = protocol;
            Target = target;
        }
    }
}