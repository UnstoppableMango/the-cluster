// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as inputs from "../../types/input";
import * as outputs from "../../types/output";
import * as utilities from "../../utilities";

import {ObjectMeta} from "../../meta/v1";

/**
 * K8sInstallerConfig is the Schema for the k8sinstallerconfigs API
 */
export class K8sInstallerConfig extends pulumi.CustomResource {
    /**
     * Get an existing K8sInstallerConfig resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): K8sInstallerConfig {
        return new K8sInstallerConfig(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'kubernetes:infrastructure.cluster.x-k8s.io/v1beta1:K8sInstallerConfig';

    /**
     * Returns true if the given object is an instance of K8sInstallerConfig.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is K8sInstallerConfig {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === K8sInstallerConfig.__pulumiType;
    }

    public readonly apiVersion!: pulumi.Output<"infrastructure.cluster.x-k8s.io/v1beta1" | undefined>;
    public readonly kind!: pulumi.Output<"K8sInstallerConfig" | undefined>;
    public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
    /**
     * K8sInstallerConfigSpec defines the desired state of K8sInstallerConfig
     */
    public readonly spec!: pulumi.Output<outputs.infrastructure.v1beta1.K8sInstallerConfigSpec | undefined>;
    /**
     * K8sInstallerConfigStatus defines the observed state of K8sInstallerConfig
     */
    public readonly status!: pulumi.Output<outputs.infrastructure.v1beta1.K8sInstallerConfigStatus | undefined>;

    /**
     * Create a K8sInstallerConfig resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: K8sInstallerConfigArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["apiVersion"] = "infrastructure.cluster.x-k8s.io/v1beta1";
            resourceInputs["kind"] = "K8sInstallerConfig";
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
        super(K8sInstallerConfig.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a K8sInstallerConfig resource.
 */
export interface K8sInstallerConfigArgs {
    apiVersion?: pulumi.Input<"infrastructure.cluster.x-k8s.io/v1beta1">;
    kind?: pulumi.Input<"K8sInstallerConfig">;
    metadata?: pulumi.Input<ObjectMeta>;
    /**
     * K8sInstallerConfigSpec defines the desired state of K8sInstallerConfig
     */
    spec?: pulumi.Input<inputs.infrastructure.v1beta1.K8sInstallerConfigSpecArgs>;
    /**
     * K8sInstallerConfigStatus defines the observed state of K8sInstallerConfig
     */
    status?: pulumi.Input<inputs.infrastructure.v1beta1.K8sInstallerConfigStatusArgs>;
}