// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "../../utilities";

// Export members:
export { AutoscalingListenerArgs } from "./autoscalingListener";
export type AutoscalingListener = import("./autoscalingListener").AutoscalingListener;
export const AutoscalingListener: typeof import("./autoscalingListener").AutoscalingListener = null as any;
utilities.lazyLoad(exports, ["AutoscalingListener"], () => require("./autoscalingListener"));

export { AutoscalingRunnerSetArgs } from "./autoscalingRunnerSet";
export type AutoscalingRunnerSet = import("./autoscalingRunnerSet").AutoscalingRunnerSet;
export const AutoscalingRunnerSet: typeof import("./autoscalingRunnerSet").AutoscalingRunnerSet = null as any;
utilities.lazyLoad(exports, ["AutoscalingRunnerSet"], () => require("./autoscalingRunnerSet"));

export { EphemeralRunnerArgs } from "./ephemeralRunner";
export type EphemeralRunner = import("./ephemeralRunner").EphemeralRunner;
export const EphemeralRunner: typeof import("./ephemeralRunner").EphemeralRunner = null as any;
utilities.lazyLoad(exports, ["EphemeralRunner"], () => require("./ephemeralRunner"));

export { EphemeralRunnerSetArgs } from "./ephemeralRunnerSet";
export type EphemeralRunnerSet = import("./ephemeralRunnerSet").EphemeralRunnerSet;
export const EphemeralRunnerSet: typeof import("./ephemeralRunnerSet").EphemeralRunnerSet = null as any;
utilities.lazyLoad(exports, ["EphemeralRunnerSet"], () => require("./ephemeralRunnerSet"));

export { HorizontalRunnerAutoscalerArgs } from "./horizontalRunnerAutoscaler";
export type HorizontalRunnerAutoscaler = import("./horizontalRunnerAutoscaler").HorizontalRunnerAutoscaler;
export const HorizontalRunnerAutoscaler: typeof import("./horizontalRunnerAutoscaler").HorizontalRunnerAutoscaler = null as any;
utilities.lazyLoad(exports, ["HorizontalRunnerAutoscaler"], () => require("./horizontalRunnerAutoscaler"));

export { RunnerArgs } from "./runner";
export type Runner = import("./runner").Runner;
export const Runner: typeof import("./runner").Runner = null as any;
utilities.lazyLoad(exports, ["Runner"], () => require("./runner"));

export { RunnerDeploymentArgs } from "./runnerDeployment";
export type RunnerDeployment = import("./runnerDeployment").RunnerDeployment;
export const RunnerDeployment: typeof import("./runnerDeployment").RunnerDeployment = null as any;
utilities.lazyLoad(exports, ["RunnerDeployment"], () => require("./runnerDeployment"));

export { RunnerReplicaSetArgs } from "./runnerReplicaSet";
export type RunnerReplicaSet = import("./runnerReplicaSet").RunnerReplicaSet;
export const RunnerReplicaSet: typeof import("./runnerReplicaSet").RunnerReplicaSet = null as any;
utilities.lazyLoad(exports, ["RunnerReplicaSet"], () => require("./runnerReplicaSet"));

export { RunnerSetArgs } from "./runnerSet";
export type RunnerSet = import("./runnerSet").RunnerSet;
export const RunnerSet: typeof import("./runnerSet").RunnerSet = null as any;
utilities.lazyLoad(exports, ["RunnerSet"], () => require("./runnerSet"));


const _module = {
    version: utilities.getVersion(),
    construct: (name: string, type: string, urn: string): pulumi.Resource => {
        switch (type) {
            case "kubernetes:actions.github.com/v1alpha1:AutoscalingListener":
                return new AutoscalingListener(name, <any>undefined, { urn })
            case "kubernetes:actions.github.com/v1alpha1:AutoscalingRunnerSet":
                return new AutoscalingRunnerSet(name, <any>undefined, { urn })
            case "kubernetes:actions.github.com/v1alpha1:EphemeralRunner":
                return new EphemeralRunner(name, <any>undefined, { urn })
            case "kubernetes:actions.github.com/v1alpha1:EphemeralRunnerSet":
                return new EphemeralRunnerSet(name, <any>undefined, { urn })
            case "kubernetes:actions.summerwind.dev/v1alpha1:HorizontalRunnerAutoscaler":
                return new HorizontalRunnerAutoscaler(name, <any>undefined, { urn })
            case "kubernetes:actions.summerwind.dev/v1alpha1:Runner":
                return new Runner(name, <any>undefined, { urn })
            case "kubernetes:actions.summerwind.dev/v1alpha1:RunnerDeployment":
                return new RunnerDeployment(name, <any>undefined, { urn })
            case "kubernetes:actions.summerwind.dev/v1alpha1:RunnerReplicaSet":
                return new RunnerReplicaSet(name, <any>undefined, { urn })
            case "kubernetes:actions.summerwind.dev/v1alpha1:RunnerSet":
                return new RunnerSet(name, <any>undefined, { urn })
            default:
                throw new Error(`unknown resource type ${type}`);
        }
    },
};
pulumi.runtime.registerResourceModule("crds", "actions.github.com/v1alpha1", _module)
pulumi.runtime.registerResourceModule("crds", "actions.summerwind.dev/v1alpha1", _module)