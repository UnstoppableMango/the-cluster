// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * VolumeSnapshotClass specifies parameters that a underlying storage system uses when creating a volume snapshot. A specific VolumeSnapshotClass is used by specifying its name in a VolumeSnapshot object. VolumeSnapshotClasses are non-namespaced
 */
export class VolumeSnapshotClass extends pulumi.CustomResource {
    /**
     * Get an existing VolumeSnapshotClass resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): VolumeSnapshotClass {
        return new VolumeSnapshotClass(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:snapshot.storage.k8s.io/v1:VolumeSnapshotClass';

    /**
     * Returns true if the given object is an instance of VolumeSnapshotClass.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is VolumeSnapshotClass {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === VolumeSnapshotClass.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"snapshot.storage.k8s.io/v1" | undefined>;
    /**
     * deletionPolicy determines whether a VolumeSnapshotContent created through the VolumeSnapshotClass should be deleted when its bound VolumeSnapshot is deleted. Supported values are "Retain" and "Delete". "Retain" means that the VolumeSnapshotContent and its physical snapshot on underlying storage system are kept. "Delete" means that the VolumeSnapshotContent and its physical snapshot on underlying storage system are deleted. Required.
     */
    public readonly deletionPolicy!: pulumi.Output<string>;
    /**
     * driver is the name of the storage driver that handles this VolumeSnapshotClass. Required.
     */
    public readonly driver!: pulumi.Output<string>;
    public readonly kind!: pulumi.Output<"VolumeSnapshotClass" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * parameters is a key-value map with storage driver specific parameters for creating snapshots. These values are opaque to Kubernetes.
     */
    public readonly parameters!: pulumi.Output<{[key: string]: string} | undefined>;

    /**
     * Create a VolumeSnapshotClass resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: VolumeSnapshotClassArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "snapshot.storage.k8s.io/v1";
            resourceInputs["deletionPolicy"] = args ? args.deletionPolicy : undefined;
            resourceInputs["driver"] = args ? args.driver : undefined;
            resourceInputs["kind"] = "VolumeSnapshotClass";
            resourceInputs["metadata"] = args ? args.metadata : undefined;
            resourceInputs["parameters"] = args ? args.parameters : undefined;
        } else {
            resourceInputs["apiVersion"] = undefined /*out*/;
            resourceInputs["deletionPolicy"] = undefined /*out*/;
            resourceInputs["driver"] = undefined /*out*/;
            resourceInputs["kind"] = undefined /*out*/;
            resourceInputs["metadata"] = undefined /*out*/;
            resourceInputs["parameters"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(VolumeSnapshotClass.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a VolumeSnapshotClass resource.
 */
export interface VolumeSnapshotClassArgs {
    apiVersion?: pulumi.Input<"snapshot.storage.k8s.io/v1">;
    /**
     * deletionPolicy determines whether a VolumeSnapshotContent created through the VolumeSnapshotClass should be deleted when its bound VolumeSnapshot is deleted. Supported values are "Retain" and "Delete". "Retain" means that the VolumeSnapshotContent and its physical snapshot on underlying storage system are kept. "Delete" means that the VolumeSnapshotContent and its physical snapshot on underlying storage system are deleted. Required.
     */
    deletionPolicy?: pulumi.Input<string>;
    /**
     * driver is the name of the storage driver that handles this VolumeSnapshotClass. Required.
     */
    driver?: pulumi.Input<string>;
    kind?: pulumi.Input<"VolumeSnapshotClass">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * parameters is a key-value map with storage driver specific parameters for creating snapshots. These values are opaque to Kubernetes.
     */
    parameters?: pulumi.Input<{[key: string]: pulumi.Input<string>}>;
}
