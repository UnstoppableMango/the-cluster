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
    public sealed class TenantSpecInitContainers
    {
        public readonly ImmutableArray<string> Args;
        public readonly ImmutableArray<string> Command;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersEnv> Env;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersEnvFrom> EnvFrom;
        public readonly string Image;
        public readonly string ImagePullPolicy;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersLifecycle Lifecycle;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersLivenessProbe LivenessProbe;
        public readonly string Name;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersPorts> Ports;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersReadinessProbe ReadinessProbe;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersResizePolicy> ResizePolicy;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersResources Resources;
        public readonly string RestartPolicy;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersSecurityContext SecurityContext;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersStartupProbe StartupProbe;
        public readonly bool Stdin;
        public readonly bool StdinOnce;
        public readonly string TerminationMessagePath;
        public readonly string TerminationMessagePolicy;
        public readonly bool Tty;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersVolumeDevices> VolumeDevices;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersVolumeMounts> VolumeMounts;
        public readonly string WorkingDir;

        [OutputConstructor]
        private TenantSpecInitContainers(
            ImmutableArray<string> args,

            ImmutableArray<string> command,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersEnv> env,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersEnvFrom> envFrom,

            string image,

            string imagePullPolicy,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersLifecycle lifecycle,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersLivenessProbe livenessProbe,

            string name,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersPorts> ports,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersReadinessProbe readinessProbe,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersResizePolicy> resizePolicy,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersResources resources,

            string restartPolicy,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersSecurityContext securityContext,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersStartupProbe startupProbe,

            bool stdin,

            bool stdinOnce,

            string terminationMessagePath,

            string terminationMessagePolicy,

            bool tty,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersVolumeDevices> volumeDevices,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainersVolumeMounts> volumeMounts,

            string workingDir)
        {
            Args = args;
            Command = command;
            Env = env;
            EnvFrom = envFrom;
            Image = image;
            ImagePullPolicy = imagePullPolicy;
            Lifecycle = lifecycle;
            LivenessProbe = livenessProbe;
            Name = name;
            Ports = ports;
            ReadinessProbe = readinessProbe;
            ResizePolicy = resizePolicy;
            Resources = resources;
            RestartPolicy = restartPolicy;
            SecurityContext = securityContext;
            StartupProbe = startupProbe;
            Stdin = stdin;
            StdinOnce = stdinOnce;
            TerminationMessagePath = terminationMessagePath;
            TerminationMessagePolicy = terminationMessagePolicy;
            Tty = tty;
            VolumeDevices = volumeDevices;
            VolumeMounts = volumeMounts;
            WorkingDir = workingDir;
        }
    }
}