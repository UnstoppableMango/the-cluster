using k8s.Models;
using KubeOps.Abstractions.Entities;

namespace UnMango.TheCluster.AutoScalingTranscodeSet.V1Alpha1;

[KubernetesEntity(Group = "thecluster.io", ApiVersion = "v1alpha1", Kind = "AutoScalingTranscodeSet")]
public partial class Entity : CustomKubernetesEntity<Spec, Status>
{
}
