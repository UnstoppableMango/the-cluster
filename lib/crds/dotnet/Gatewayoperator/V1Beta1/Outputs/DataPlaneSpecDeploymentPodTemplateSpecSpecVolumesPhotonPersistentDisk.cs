// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// photonPersistentDisk represents a PhotonController persistent disk attached and mounted on kubelets host machine
    /// </summary>
    [OutputType]
    public sealed class DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesPhotonPersistentDisk
    {
        /// <summary>
        /// fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified.
        /// </summary>
        public readonly string FsType;
        /// <summary>
        /// pdID is the ID that identifies Photon Controller persistent disk
        /// </summary>
        public readonly string PdID;

        [OutputConstructor]
        private DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesPhotonPersistentDisk(
            string fsType,

            string pdID)
        {
            FsType = fsType;
            PdID = pdID;
        }
    }
}