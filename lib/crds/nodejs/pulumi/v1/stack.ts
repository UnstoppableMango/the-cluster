// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * Stack is the Schema for the stacks API
 */
export class Stack extends pulumi.CustomResource {
    /**
     * Get an existing Stack resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): Stack {
        return new Stack(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:pulumi.com/v1:Stack';

    /**
     * Returns true if the given object is an instance of Stack.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is Stack {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === Stack.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"pulumi.com/v1" | undefined>;
    public readonly kind!: pulumi.Output<"Stack" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * StackSpec defines the desired state of Pulumi Stack being managed by this operator.
     */
    public readonly spec!: pulumi.Output<outputs.pulumiOperator.v1.StackSpec | undefined>;
    /**
     * StackStatus defines the observed state of Stack
     */
    public readonly status!: pulumi.Output<outputs.pulumiOperator.v1.StackStatus | undefined>;

    /**
     * Create a Stack resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: StackArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "pulumi.com/v1";
            resourceInputs["kind"] = "Stack";
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
        super(Stack.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a Stack resource.
 */
export interface StackArgs {
    apiVersion?: pulumi.Input<"pulumi.com/v1">;
    kind?: pulumi.Input<"Stack">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * StackSpec defines the desired state of Pulumi Stack being managed by this operator.
     */
    spec?: pulumi.Input<inputs.pulumiOperator.v1.StackSpecArgs>;
    /**
     * StackStatus defines the observed state of Stack
     */
    status?: pulumi.Input<inputs.pulumiOperator.v1.StackStatusArgs>;
}