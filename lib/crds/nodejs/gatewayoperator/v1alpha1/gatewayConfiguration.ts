// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * GatewayConfiguration is the Schema for the gatewayconfigurations API
 */
export class GatewayConfiguration extends pulumi.CustomResource {
    /**
     * Get an existing GatewayConfiguration resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): GatewayConfiguration {
        return new GatewayConfiguration(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:gateway-operator.konghq.com/v1alpha1:GatewayConfiguration';

    /**
     * Returns true if the given object is an instance of GatewayConfiguration.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is GatewayConfiguration {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === GatewayConfiguration.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"gateway-operator.konghq.com/v1alpha1" | undefined>;
    public readonly kind!: pulumi.Output<"GatewayConfiguration" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * GatewayConfigurationSpec defines the desired state of GatewayConfiguration
     */
    public readonly spec!: pulumi.Output<outputs.gatewayoperator.v1alpha1.GatewayConfigurationSpec | undefined>;
    /**
     * GatewayConfigurationStatus defines the observed state of GatewayConfiguration
     */
    public readonly status!: pulumi.Output<outputs.gatewayoperator.v1alpha1.GatewayConfigurationStatus | undefined>;

    /**
     * Create a GatewayConfiguration resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: GatewayConfigurationArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "gateway-operator.konghq.com/v1alpha1";
            resourceInputs["kind"] = "GatewayConfiguration";
            resourceInputs["metadata"] = args ? args.metadata : undefined;
            resourceInputs["spec"] = args ? (args.spec ? pulumi.output(args.spec).apply(inputs.gatewayoperator.v1alpha1.gatewayConfigurationSpecArgsProvideDefaults) : undefined) : undefined;
            resourceInputs["status"] = args ? args.status : undefined;
        } else {
            resourceInputs["apiVersion"] = undefined /*out*/;
            resourceInputs["kind"] = undefined /*out*/;
            resourceInputs["metadata"] = undefined /*out*/;
            resourceInputs["spec"] = undefined /*out*/;
            resourceInputs["status"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(GatewayConfiguration.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a GatewayConfiguration resource.
 */
export interface GatewayConfigurationArgs {
    apiVersion?: pulumi.Input<"gateway-operator.konghq.com/v1alpha1">;
    kind?: pulumi.Input<"GatewayConfiguration">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * GatewayConfigurationSpec defines the desired state of GatewayConfiguration
     */
    spec?: pulumi.Input<inputs.gatewayoperator.v1alpha1.GatewayConfigurationSpecArgs>;
    /**
     * GatewayConfigurationStatus defines the observed state of GatewayConfiguration
     */
    status?: pulumi.Input<inputs.gatewayoperator.v1alpha1.GatewayConfigurationStatusArgs>;
}
