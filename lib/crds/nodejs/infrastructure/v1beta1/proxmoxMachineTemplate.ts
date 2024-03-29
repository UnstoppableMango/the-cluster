// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * ProxmoxMachineTemplate is the Schema for the proxmoxmachinetemplates API
 */
export class ProxmoxMachineTemplate extends pulumi.CustomResource {
    /**
     * Get an existing ProxmoxMachineTemplate resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): ProxmoxMachineTemplate {
        return new ProxmoxMachineTemplate(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:infrastructure.cluster.x-k8s.io/v1beta1:ProxmoxMachineTemplate';

    /**
     * Returns true if the given object is an instance of ProxmoxMachineTemplate.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is ProxmoxMachineTemplate {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === ProxmoxMachineTemplate.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"infrastructure.cluster.x-k8s.io/v1beta1" | undefined>;
    public readonly kind!: pulumi.Output<"ProxmoxMachineTemplate" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * ProxmoxMachineTemplateSpec defines the desired state of ProxmoxMachineTemplate
     */
    public readonly spec!: pulumi.Output<outputs.infrastructure.v1beta1.ProxmoxMachineTemplateSpec | undefined>;
    /**
     * ProxmoxMachineTemplateStatus defines the observed state of ProxmoxMachineTemplate
     */
    public readonly status!: pulumi.Output<{[key: string]: any} | undefined>;

    /**
     * Create a ProxmoxMachineTemplate resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: ProxmoxMachineTemplateArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "infrastructure.cluster.x-k8s.io/v1beta1";
            resourceInputs["kind"] = "ProxmoxMachineTemplate";
            resourceInputs["metadata"] = args ? args.metadata : undefined;
            resourceInputs["spec"] = args ? (args.spec ? pulumi.output(args.spec).apply(inputs.infrastructure.v1beta1.proxmoxMachineTemplateSpecArgsProvideDefaults) : undefined) : undefined;
            resourceInputs["status"] = args ? args.status : undefined;
        } else {
            resourceInputs["apiVersion"] = undefined /*out*/;
            resourceInputs["kind"] = undefined /*out*/;
            resourceInputs["metadata"] = undefined /*out*/;
            resourceInputs["spec"] = undefined /*out*/;
            resourceInputs["status"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(ProxmoxMachineTemplate.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a ProxmoxMachineTemplate resource.
 */
export interface ProxmoxMachineTemplateArgs {
    apiVersion?: pulumi.Input<"infrastructure.cluster.x-k8s.io/v1beta1">;
    kind?: pulumi.Input<"ProxmoxMachineTemplate">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * ProxmoxMachineTemplateSpec defines the desired state of ProxmoxMachineTemplate
     */
    spec?: pulumi.Input<inputs.infrastructure.v1beta1.ProxmoxMachineTemplateSpecArgs>;
    /**
     * ProxmoxMachineTemplateStatus defines the observed state of ProxmoxMachineTemplate
     */
    status?: pulumi.Input<{[key: string]: any}>;
}
