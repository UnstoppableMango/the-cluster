// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * VirtualServerRoute defines the VirtualServerRoute resource.
 */
export class VirtualServerRoute extends pulumi.CustomResource {
    /**
     * Get an existing VirtualServerRoute resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): VirtualServerRoute {
        return new VirtualServerRoute(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:k8s.nginx.org/v1:VirtualServerRoute';

    /**
     * Returns true if the given object is an instance of VirtualServerRoute.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is VirtualServerRoute {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === VirtualServerRoute.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"k8s.nginx.org/v1" | undefined>;
    public readonly kind!: pulumi.Output<"VirtualServerRoute" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * VirtualServerRouteSpec is the spec of the VirtualServerRoute resource.
     */
    public readonly spec!: pulumi.Output<outputs.k8s.v1.VirtualServerRouteSpec | undefined>;
    /**
     * VirtualServerRouteStatus defines the status for the VirtualServerRoute resource.
     */
    public readonly status!: pulumi.Output<outputs.k8s.v1.VirtualServerRouteStatus | undefined>;

    /**
     * Create a VirtualServerRoute resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: VirtualServerRouteArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "k8s.nginx.org/v1";
            resourceInputs["kind"] = "VirtualServerRoute";
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
        super(VirtualServerRoute.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a VirtualServerRoute resource.
 */
export interface VirtualServerRouteArgs {
    apiVersion?: pulumi.Input<"k8s.nginx.org/v1">;
    kind?: pulumi.Input<"VirtualServerRoute">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * VirtualServerRouteSpec is the spec of the VirtualServerRoute resource.
     */
    spec?: pulumi.Input<inputs.k8s.v1.VirtualServerRouteSpecArgs>;
    /**
     * VirtualServerRouteStatus defines the status for the VirtualServerRoute resource.
     */
    status?: pulumi.Input<inputs.k8s.v1.VirtualServerRouteStatusArgs>;
}