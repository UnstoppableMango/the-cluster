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
    public sealed class TenantSpecPoolsContainerSecurityContext
    {
        public readonly bool AllowPrivilegeEscalation;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextCapabilities Capabilities;
        public readonly bool Privileged;
        public readonly string ProcMount;
        public readonly bool ReadOnlyRootFilesystem;
        public readonly int RunAsGroup;
        public readonly bool RunAsNonRoot;
        public readonly int RunAsUser;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextSeLinuxOptions SeLinuxOptions;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextSeccompProfile SeccompProfile;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextWindowsOptions WindowsOptions;

        [OutputConstructor]
        private TenantSpecPoolsContainerSecurityContext(
            bool allowPrivilegeEscalation,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextCapabilities capabilities,

            bool privileged,

            string procMount,

            bool readOnlyRootFilesystem,

            int runAsGroup,

            bool runAsNonRoot,

            int runAsUser,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextSeLinuxOptions seLinuxOptions,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextSeccompProfile seccompProfile,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContextWindowsOptions windowsOptions)
        {
            AllowPrivilegeEscalation = allowPrivilegeEscalation;
            Capabilities = capabilities;
            Privileged = privileged;
            ProcMount = procMount;
            ReadOnlyRootFilesystem = readOnlyRootFilesystem;
            RunAsGroup = runAsGroup;
            RunAsNonRoot = runAsNonRoot;
            RunAsUser = runAsUser;
            SeLinuxOptions = seLinuxOptions;
            SeccompProfile = seccompProfile;
            WindowsOptions = windowsOptions;
        }
    }
}