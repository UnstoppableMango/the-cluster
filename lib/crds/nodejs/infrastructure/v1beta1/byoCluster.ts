// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * ByoCluster is the Schema for the byoclusters API
 */
export class ByoCluster extends pulumi.CustomResource {
    /**
     * Get an existing ByoCluster resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): ByoCluster {
        return new ByoCluster(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:infrastructure.cluster.x-k8s.io/v1beta1:ByoCluster';

    /**
     * Returns true if the given object is an instance of ByoCluster.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is ByoCluster {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === ByoCluster.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"infrastructure.cluster.x-k8s.io/v1beta1" | undefined>;
    public readonly kind!: pulumi.Output<"ByoCluster" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * ByoClusterSpec defines the desired state of ByoCluster
     */
    public readonly spec!: pulumi.Output<outputs.infrastructure.v1beta1.ByoClusterSpec | undefined>;
    /**
     * ByoClusterStatus defines the observed state of ByoCluster
     */
    public readonly status!: pulumi.Output<outputs.infrastructure.v1beta1.ByoClusterStatus | undefined>;

    /**
     * Create a ByoCluster resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: ByoClusterArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "infrastructure.cluster.x-k8s.io/v1beta1";
            resourceInputs["kind"] = "ByoCluster";
            resourceInputs["metadata"] = args ? args.metadata : undefined;
            resourceInputs["spec"] = args ? args.spec : undefined;
            resourceInputs["status"] = args ? args.status : undefined;
        } else {
            resourceInputs["apiVersion"] = undefined /*out*/;
            resourceInputs["kind"] = undefined /*out*/;
            resourceInputs["metadata"] = undefined /*out*/;
            resourceInputs["spec"] = undefined /*out*/;
            resourceInputs["status"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(ByoCluster.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a ByoCluster resource.
 */
export interface ByoClusterArgs {
    apiVersion?: pulumi.Input<"infrastructure.cluster.x-k8s.io/v1beta1">;
    kind?: pulumi.Input<"ByoCluster">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * ByoClusterSpec defines the desired state of ByoCluster
     */
    spec?: pulumi.Input<inputs.infrastructure.v1beta1.ByoClusterSpecArgs>;
    /**
     * ByoClusterStatus defines the observed state of ByoCluster
     */
    status?: pulumi.Input<inputs.infrastructure.v1beta1.ByoClusterStatusArgs>;
}
