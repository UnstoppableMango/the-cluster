// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * ClusterTunnel is the Schema for the clustertunnels API
 */
export class ClusterTunnel extends pulumi.CustomResource {
    /**
     * Get an existing ClusterTunnel resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): ClusterTunnel {
        return new ClusterTunnel(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:networking.cfargotunnel.com/v1alpha1:ClusterTunnel';

    /**
     * Returns true if the given object is an instance of ClusterTunnel.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is ClusterTunnel {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === ClusterTunnel.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"networking.cfargotunnel.com/v1alpha1" | undefined>;
    public readonly kind!: pulumi.Output<"ClusterTunnel" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * TunnelSpec defines the desired state of Tunnel
     */
    public readonly spec!: pulumi.Output<outputs.networking.v1alpha1.ClusterTunnelSpec | undefined>;
    /**
     * TunnelStatus defines the observed state of Tunnel
     */
    public readonly status!: pulumi.Output<outputs.networking.v1alpha1.ClusterTunnelStatus | undefined>;

    /**
     * Create a ClusterTunnel resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: ClusterTunnelArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "networking.cfargotunnel.com/v1alpha1";
            resourceInputs["kind"] = "ClusterTunnel";
            resourceInputs["metadata"] = args ? args.metadata : undefined;
            resourceInputs["spec"] = args ? (args.spec ? pulumi.output(args.spec).apply(inputs.networking.v1alpha1.clusterTunnelSpecArgsProvideDefaults) : undefined) : undefined;
            resourceInputs["status"] = args ? args.status : undefined;
        } else {
            resourceInputs["apiVersion"] = undefined /*out*/;
            resourceInputs["kind"] = undefined /*out*/;
            resourceInputs["metadata"] = undefined /*out*/;
            resourceInputs["spec"] = undefined /*out*/;
            resourceInputs["status"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(ClusterTunnel.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a ClusterTunnel resource.
 */
export interface ClusterTunnelArgs {
    apiVersion?: pulumi.Input<"networking.cfargotunnel.com/v1alpha1">;
    kind?: pulumi.Input<"ClusterTunnel">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * TunnelSpec defines the desired state of Tunnel
     */
    spec?: pulumi.Input<inputs.networking.v1alpha1.ClusterTunnelSpecArgs>;
    /**
     * TunnelStatus defines the observed state of Tunnel
     */
    status?: pulumi.Input<inputs.networking.v1alpha1.ClusterTunnelStatusArgs>;
}
