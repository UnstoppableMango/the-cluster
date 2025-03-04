// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * TalosConfig is the Schema for the talosconfigs API
 */
export class TalosConfig extends pulumi.CustomResource {
    /**
     * Get an existing TalosConfig resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): TalosConfig {
        return new TalosConfig(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:bootstrap.cluster.x-k8s.io/v1alpha2:TalosConfig';

    /**
     * Returns true if the given object is an instance of TalosConfig.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is TalosConfig {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === TalosConfig.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"bootstrap.cluster.x-k8s.io/v1alpha2" | undefined>;
    public readonly kind!: pulumi.Output<"TalosConfig" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * TalosConfigSpec defines the desired state of TalosConfig
     */
    public readonly spec!: pulumi.Output<outputs.bootstrap.v1alpha2.TalosConfigSpec | undefined>;
    /**
     * TalosConfigStatus defines the observed state of TalosConfig
     */
    public readonly status!: pulumi.Output<outputs.bootstrap.v1alpha2.TalosConfigStatus | undefined>;

    /**
     * Create a TalosConfig resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: TalosConfigArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "bootstrap.cluster.x-k8s.io/v1alpha2";
            resourceInputs["kind"] = "TalosConfig";
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
        super(TalosConfig.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a TalosConfig resource.
 */
export interface TalosConfigArgs {
    apiVersion?: pulumi.Input<"bootstrap.cluster.x-k8s.io/v1alpha2">;
    kind?: pulumi.Input<"TalosConfig">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * TalosConfigSpec defines the desired state of TalosConfig
     */
    spec?: pulumi.Input<inputs.bootstrap.v1alpha2.TalosConfigSpecArgs>;
    /**
     * TalosConfigStatus defines the observed state of TalosConfig
     */
    status?: pulumi.Input<inputs.bootstrap.v1alpha2.TalosConfigStatusArgs>;
}
