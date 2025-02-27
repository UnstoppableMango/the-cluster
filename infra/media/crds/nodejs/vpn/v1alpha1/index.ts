// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "../../utilities";

// Export members:
export { WireguardArgs } from "./wireguard";
export type Wireguard = import("./wireguard").Wireguard;
export const Wireguard: typeof import("./wireguard").Wireguard = null as any;
utilities.lazyLoad(exports, ["Wireguard"], () => require("./wireguard"));

export { WireguardListArgs } from "./wireguardList";
export type WireguardList = import("./wireguardList").WireguardList;
export const WireguardList: typeof import("./wireguardList").WireguardList = null as any;
utilities.lazyLoad(exports, ["WireguardList"], () => require("./wireguardList"));

export { WireguardPatchArgs } from "./wireguardPatch";
export type WireguardPatch = import("./wireguardPatch").WireguardPatch;
export const WireguardPatch: typeof import("./wireguardPatch").WireguardPatch = null as any;
utilities.lazyLoad(exports, ["WireguardPatch"], () => require("./wireguardPatch"));

export { WireguardPeerArgs } from "./wireguardPeer";
export type WireguardPeer = import("./wireguardPeer").WireguardPeer;
export const WireguardPeer: typeof import("./wireguardPeer").WireguardPeer = null as any;
utilities.lazyLoad(exports, ["WireguardPeer"], () => require("./wireguardPeer"));

export { WireguardPeerListArgs } from "./wireguardPeerList";
export type WireguardPeerList = import("./wireguardPeerList").WireguardPeerList;
export const WireguardPeerList: typeof import("./wireguardPeerList").WireguardPeerList = null as any;
utilities.lazyLoad(exports, ["WireguardPeerList"], () => require("./wireguardPeerList"));

export { WireguardPeerPatchArgs } from "./wireguardPeerPatch";
export type WireguardPeerPatch = import("./wireguardPeerPatch").WireguardPeerPatch;
export const WireguardPeerPatch: typeof import("./wireguardPeerPatch").WireguardPeerPatch = null as any;
utilities.lazyLoad(exports, ["WireguardPeerPatch"], () => require("./wireguardPeerPatch"));


const _module = {
    version: utilities.getVersion(),
    construct: (name: string, type: string, urn: string): pulumi.Resource => {
        switch (type) {
            case "kubernetes:vpn.wireguard-operator.io/v1alpha1:Wireguard":
                return new Wireguard(name, <any>undefined, { urn })
            case "kubernetes:vpn.wireguard-operator.io/v1alpha1:WireguardList":
                return new WireguardList(name, <any>undefined, { urn })
            case "kubernetes:vpn.wireguard-operator.io/v1alpha1:WireguardPatch":
                return new WireguardPatch(name, <any>undefined, { urn })
            case "kubernetes:vpn.wireguard-operator.io/v1alpha1:WireguardPeer":
                return new WireguardPeer(name, <any>undefined, { urn })
            case "kubernetes:vpn.wireguard-operator.io/v1alpha1:WireguardPeerList":
                return new WireguardPeerList(name, <any>undefined, { urn })
            case "kubernetes:vpn.wireguard-operator.io/v1alpha1:WireguardPeerPatch":
                return new WireguardPeerPatch(name, <any>undefined, { urn })
            default:
                throw new Error(`unknown resource type ${type}`);
        }
    },
};
pulumi.runtime.registerResourceModule("crds", "vpn.wireguard-operator.io/v1alpha1", _module)
