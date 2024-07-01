module UnMango.TheCluster.AutoScalingTranscodeSet

open System.Threading.Tasks
open KubeOps.Abstractions.Controller
open KubeOps.Abstractions.Finalizer
open KubeOps.Abstractions.Rbac
open KubeOps.KubernetesClient
open UnMango.TheCluster.AutoScalingTranscodeSet.V1Alpha1

// module V1Alpha1 =
//     type RemoveJob =
//         interface IEntityFinalizer<Entity> with
//             member this.FinalizeAsync(entity: Entity) : Task = Task.CompletedTask
//
//     [<EntityRbac(typeof<Entity>, Verbs = RbacVerb.All)>]
//     type Controller(client: IKubernetesClient, removeJob: EntityFinalizerAttacher<RemoveJob, Entity>) =
//         interface IEntityController<Entity> with
//             member this.ReconcileAsync(entity: Entity) : Task = task { return! Task.CompletedTask }
//             member this.DeletedAsync(entity: Entity) : Task = Task.CompletedTask
