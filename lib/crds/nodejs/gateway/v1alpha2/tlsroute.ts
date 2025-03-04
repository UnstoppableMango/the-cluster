// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * The TLSRoute resource is similar to TCPRoute, but can be configured to match against TLS-specific metadata. This allows more flexibility in matching streams for a given TLS listener.
 *  If you need to forward traffic to a single target for a TLS listener, you could choose to use a TCPRoute with a TLS listener.
 */
export class TLSRoute extends pulumi.CustomResource {
    /**
     * Get an existing TLSRoute resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): TLSRoute {
        return new TLSRoute(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:gateway.networking.k8s.io/v1alpha2:TLSRoute';

    /**
     * Returns true if the given object is an instance of TLSRoute.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is TLSRoute {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === TLSRoute.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"gateway.networking.k8s.io/v1alpha2" | undefined>;
    public readonly kind!: pulumi.Output<"TLSRoute" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * Spec defines the desired state of TLSRoute.
     */
    public readonly spec!: pulumi.Output<outputs.gateway.v1alpha2.TLSRouteSpec>;
    /**
     * Status defines the current state of TLSRoute.
     */
    public readonly status!: pulumi.Output<outputs.gateway.v1alpha2.TLSRouteStatus | undefined>;

    /**
     * Create a TLSRoute resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: TLSRouteArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "gateway.networking.k8s.io/v1alpha2";
            resourceInputs["kind"] = "TLSRoute";
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
        super(TLSRoute.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a TLSRoute resource.
 */
export interface TLSRouteArgs {
    apiVersion?: pulumi.Input<"gateway.networking.k8s.io/v1alpha2">;
    kind?: pulumi.Input<"TLSRoute">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * Spec defines the desired state of TLSRoute.
     */
    spec?: pulumi.Input<inputs.gateway.v1alpha2.TLSRouteSpecArgs>;
    /**
     * Status defines the current state of TLSRoute.
     */
    status?: pulumi.Input<inputs.gateway.v1alpha2.TLSRouteStatusArgs>;
}
