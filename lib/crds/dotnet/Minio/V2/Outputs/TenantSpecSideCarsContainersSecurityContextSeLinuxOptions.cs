// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Minio.V2
{

    [OutputType]
    public sealed class TenantSpecSideCarsContainersSecurityContextSeLinuxOptions
    {
        public readonly string Level;
        public readonly string Role;
        public readonly string Type;
        public readonly string User;

        [OutputConstructor]
        private TenantSpecSideCarsContainersSecurityContextSeLinuxOptions(
            string level,

            string role,

            string type,

            string user)
        {
            Level = level;
            Role = role;
            Type = type;
            User = user;
        }
    }
}
