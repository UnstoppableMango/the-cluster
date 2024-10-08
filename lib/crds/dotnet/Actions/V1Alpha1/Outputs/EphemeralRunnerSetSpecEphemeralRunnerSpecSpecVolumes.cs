// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1
{

    /// <summary>
    /// Volume represents a named volume in a pod that may be accessed by any container in the pod.
    /// </summary>
    [OutputType]
    public sealed class EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumes
    {
        /// <summary>
        /// awsElasticBlockStore represents an AWS Disk resource that is attached to a kubelet's host machine and then exposed to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesAwsElasticBlockStore AwsElasticBlockStore;
        /// <summary>
        /// azureDisk represents an Azure Data Disk mount on the host and bind mount to the pod.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesAzureDisk AzureDisk;
        /// <summary>
        /// azureFile represents an Azure File Service mount on the host and bind mount to the pod.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesAzureFile AzureFile;
        /// <summary>
        /// cephFS represents a Ceph FS mount on the host that shares a pod's lifetime
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesCephfs Cephfs;
        /// <summary>
        /// cinder represents a cinder volume attached and mounted on kubelets host machine. More info: https://examples.k8s.io/mysql-cinder-pd/README.md
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesCinder Cinder;
        /// <summary>
        /// configMap represents a configMap that should populate this volume
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesConfigMap ConfigMap;
        /// <summary>
        /// csi (Container Storage Interface) represents ephemeral storage that is handled by certain external CSI drivers (Beta feature).
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesCsi Csi;
        /// <summary>
        /// downwardAPI represents downward API about the pod that should populate this volume
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesDownwardApi DownwardAPI;
        /// <summary>
        /// emptyDir represents a temporary directory that shares a pod's lifetime. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesEmptyDir EmptyDir;
        /// <summary>
        /// ephemeral represents a volume that is handled by a cluster storage driver. The volume's lifecycle is tied to the pod that defines it - it will be created before the pod starts, and deleted when the pod is removed. 
        ///  Use this if: a) the volume is only needed while the pod runs, b) features of normal volumes like restoring from snapshot or capacity tracking are needed, c) the storage driver is specified through a storage class, and d) the storage driver supports dynamic volume provisioning through a PersistentVolumeClaim (see EphemeralVolumeSource for more information on the connection between this volume type and PersistentVolumeClaim). 
        ///  Use PersistentVolumeClaim or one of the vendor-specific APIs for volumes that persist for longer than the lifecycle of an individual pod. 
        ///  Use CSI for light-weight local ephemeral volumes if the CSI driver is meant to be used that way - see the documentation of the driver for more information. 
        ///  A pod can use both types of ephemeral volumes and persistent volumes at the same time.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesEphemeral Ephemeral;
        /// <summary>
        /// fc represents a Fibre Channel resource that is attached to a kubelet's host machine and then exposed to the pod.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesFc Fc;
        /// <summary>
        /// flexVolume represents a generic volume resource that is provisioned/attached using an exec based plugin.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesFlexVolume FlexVolume;
        /// <summary>
        /// flocker represents a Flocker volume attached to a kubelet's host machine. This depends on the Flocker control service being running
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesFlocker Flocker;
        /// <summary>
        /// gcePersistentDisk represents a GCE Disk resource that is attached to a kubelet's host machine and then exposed to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesGcePersistentDisk GcePersistentDisk;
        /// <summary>
        /// gitRepo represents a git repository at a particular revision. DEPRECATED: GitRepo is deprecated. To provision a container with a git repo, mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod's container.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesGitRepo GitRepo;
        /// <summary>
        /// glusterfs represents a Glusterfs mount on the host that shares a pod's lifetime. More info: https://examples.k8s.io/volumes/glusterfs/README.md
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesGlusterfs Glusterfs;
        /// <summary>
        /// hostPath represents a pre-existing file or directory on the host machine that is directly exposed to the container. This is generally used for system agents or other privileged things that are allowed to see the host machine. Most containers will NOT need this. More info: https://kubernetes.io/docs/concepts/storage/volumes#hostpath --- TODO(jonesdl) We need to restrict who can use host directory mounts and who can/can not mount host directories as read/write.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesHostPath HostPath;
        /// <summary>
        /// iscsi represents an ISCSI Disk resource that is attached to a kubelet's host machine and then exposed to the pod. More info: https://examples.k8s.io/volumes/iscsi/README.md
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesIscsi Iscsi;
        /// <summary>
        /// name of the volume. Must be a DNS_LABEL and unique within the pod. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
        /// </summary>
        public readonly string Name;
        /// <summary>
        /// nfs represents an NFS mount on the host that shares a pod's lifetime More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesNfs Nfs;
        /// <summary>
        /// persistentVolumeClaimVolumeSource represents a reference to a PersistentVolumeClaim in the same namespace. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesPersistentVolumeClaim PersistentVolumeClaim;
        /// <summary>
        /// photonPersistentDisk represents a PhotonController persistent disk attached and mounted on kubelets host machine
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesPhotonPersistentDisk PhotonPersistentDisk;
        /// <summary>
        /// portworxVolume represents a portworx volume attached and mounted on kubelets host machine
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesPortworxVolume PortworxVolume;
        /// <summary>
        /// projected items for all in one resources secrets, configmaps, and downward API
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjected Projected;
        /// <summary>
        /// quobyte represents a Quobyte mount on the host that shares a pod's lifetime
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesQuobyte Quobyte;
        /// <summary>
        /// rbd represents a Rados Block Device mount on the host that shares a pod's lifetime. More info: https://examples.k8s.io/volumes/rbd/README.md
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesRbd Rbd;
        /// <summary>
        /// scaleIO represents a ScaleIO persistent volume attached and mounted on Kubernetes nodes.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesScaleIo ScaleIO;
        /// <summary>
        /// secret represents a secret that should populate this volume. More info: https://kubernetes.io/docs/concepts/storage/volumes#secret
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesSecret Secret;
        /// <summary>
        /// storageOS represents a StorageOS volume attached and mounted on Kubernetes nodes.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesStorageos Storageos;
        /// <summary>
        /// vsphereVolume represents a vSphere volume attached and mounted on kubelets host machine
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesVsphereVolume VsphereVolume;

        [OutputConstructor]
        private EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumes(
            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesAwsElasticBlockStore awsElasticBlockStore,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesAzureDisk azureDisk,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesAzureFile azureFile,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesCephfs cephfs,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesCinder cinder,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesConfigMap configMap,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesCsi csi,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesDownwardApi downwardAPI,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesEmptyDir emptyDir,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesEphemeral ephemeral,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesFc fc,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesFlexVolume flexVolume,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesFlocker flocker,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesGcePersistentDisk gcePersistentDisk,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesGitRepo gitRepo,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesGlusterfs glusterfs,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesHostPath hostPath,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesIscsi iscsi,

            string name,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesNfs nfs,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesPersistentVolumeClaim persistentVolumeClaim,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesPhotonPersistentDisk photonPersistentDisk,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesPortworxVolume portworxVolume,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjected projected,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesQuobyte quobyte,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesRbd rbd,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesScaleIo scaleIO,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesSecret secret,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesStorageos storageos,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesVsphereVolume vsphereVolume)
        {
            AwsElasticBlockStore = awsElasticBlockStore;
            AzureDisk = azureDisk;
            AzureFile = azureFile;
            Cephfs = cephfs;
            Cinder = cinder;
            ConfigMap = configMap;
            Csi = csi;
            DownwardAPI = downwardAPI;
            EmptyDir = emptyDir;
            Ephemeral = ephemeral;
            Fc = fc;
            FlexVolume = flexVolume;
            Flocker = flocker;
            GcePersistentDisk = gcePersistentDisk;
            GitRepo = gitRepo;
            Glusterfs = glusterfs;
            HostPath = hostPath;
            Iscsi = iscsi;
            Name = name;
            Nfs = nfs;
            PersistentVolumeClaim = persistentVolumeClaim;
            PhotonPersistentDisk = photonPersistentDisk;
            PortworxVolume = portworxVolume;
            Projected = projected;
            Quobyte = quobyte;
            Rbd = rbd;
            ScaleIO = scaleIO;
            Secret = secret;
            Storageos = storageos;
            VsphereVolume = vsphereVolume;
        }
    }
}
