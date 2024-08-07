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
    /// Source for the environment variable's value. Cannot be used if value is not empty.
    /// </summary>
    [OutputType]
    public sealed class DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFrom
    {
        /// <summary>
        /// Selects a key of a ConfigMap.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromConfigMapKeyRef ConfigMapKeyRef;
        /// <summary>
        /// Selects a field of the pod: supports metadata.name, metadata.namespace, `metadata.labels['&lt;KEY&gt;']`, `metadata.annotations['&lt;KEY&gt;']`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromFieldRef FieldRef;
        /// <summary>
        /// Selects a resource of the container: only resources limits and requests (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromResourceFieldRef ResourceFieldRef;
        /// <summary>
        /// Selects a key of a secret in the pod's namespace
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromSecretKeyRef SecretKeyRef;

        [OutputConstructor]
        private DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFrom(
            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromConfigMapKeyRef configMapKeyRef,

            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromFieldRef fieldRef,

            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromResourceFieldRef resourceFieldRef,

            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvValueFromSecretKeyRef secretKeyRef)
        {
            ConfigMapKeyRef = configMapKeyRef;
            FieldRef = fieldRef;
            ResourceFieldRef = resourceFieldRef;
            SecretKeyRef = secretKeyRef;
        }
    }
}
