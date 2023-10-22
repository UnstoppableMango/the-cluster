import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import * as std from "@pulumi/std";
import * as talos from "@pulumiverse/talos";

function notImplemented(message: string) {
    throw new Error(message);
}

const config = new pulumi.Config();
// A name to provide for the Talos cluster
const clusterName = config.get("clusterName") || "rosequartz";
// The primary DNS name to use
const primaryDnsName = config.get("primaryDnsName");
// The public IP used for the Talos cluster
const publicIp = config.get("publicIp") || "10.5.0.2";
// Subject Alternative Names to use for certificates
const certSans = config.getObject<Array<string>>("certSans") || ["10.5.0.2"];
// A map of node data
const nodeData = config.getObject<{controlplanes?: Record<string, {hostname?: string, installDisk?: string}>, workers?: Record<string, {hostname?: string, installDisk?: string}>}>("nodeData") || {
    controlplanes: {
        "10.5.0.2": {
            hostname: "rqctrl1",
            installDisk: "/dev/sda",
        },
    },
    workers: {},
};
// Timeout for the health operation
const healthTimeout = config.get("healthTimeout") || "4m";
// Timeout for the kubeconfig operation
const kubeconfigTimeout = config.get("kubeconfigTimeout") || "30s";
const k8sVersion = notImplemented("yamldecode(file(\".versions\"))")["kubernetes/kubernetes"];
const talosVersion = notImplemented("yamldecode(file(\".versions\"))")["siderolabs/talos"];
const kscaVersion = notImplemented("yamldecode(file(\".versions\"))")["alex1989hu/kubelet-serving-cert-approver"];
const installerImage = `ghcr.io/siderolabs/installer:v${talosVersion}`;
const allNodeData = notImplemented("merge(var.node_data.controlplanes,var.node_data.workers)");
const zoneId = "22f1d42ba0fbe4f924905e1c6597055c";
const endpoint = notImplemented("coalesce(var.primary_dns_name,var.public_ip)");
const clusterEndpoint = `https://${endpoint}:6443`;
const mycertSans = std.concatOutput({
    input: [
        [
            publicIp,
            endpoint,
        ],
        certSans,
    ],
}).apply(invoke => invoke.result);
const primaryDns: cloudflare.Record[] = [];
for (const range = {value: 0}; range.value < (notImplemented("terraform.workspace") == "rosequartz-prod" ? 1 : 0); range.value++) {
    primaryDns.push(new cloudflare.Record(`primary_dns-${range.value}`, {
        name: primaryDnsName,
        zoneId: zoneId,
        type: "A",
        value: publicIp,
        proxied: false,
    }));
}
const ssl: cloudflare.Ruleset[] = [];
for (const range = {value: 0}; range.value < (notImplemented("terraform.workspace") == "rosequartz-prod" ? 1 : 0); range.value++) {
    ssl.push(new cloudflare.Ruleset(`ssl-${range.value}`, {
        name: `${primaryDnsName} SSL`,
        description: `Set SSL to a value that works for ${primaryDnsName}`,
        kind: "zone",
        zoneId: zoneId,
        phase: "http_config_settings",
        rules: [{
            action: "set_config",
            actionParameters: {
                ssl: "full",
            },
            expression: `(http.host eq "${primaryDnsName}") or (http.host eq "pd.thecluster.io")`,
        }],
    }));
}
const thisResource = new talos.machine.Secrets("this", {talosVersion: `v${talosVersion}`});
const controlplane = talos.machine.configuration({
    clusterName: clusterName,
    clusterEndpoint: clusterEndpoint,
    machineType: "controlplane",
    machineSecrets: thisResource.machineSecrets,
    docs: false,
    examples: false,
    talosVersion: `v${talosVersion}`,
    kubernetesVersion: k8sVersion,
});
const this = talos.index.clientConfiguration({
    clusterName: clusterName,
    clientConfiguration: thisResource.clientConfiguration,
    endpoints: [endpoint],
    nodes: .map(([, ]) => (k)),
});
const controlplaneResource: talos.index.MachineConfigurationApply[] = [];
for (const range of Object.entries(nodeData.controlplanes).map(([k, v]) => ({key: k, value: v}))) {
    controlplaneResource.push(new talos.index.MachineConfigurationApply(`controlplane-${range.key}`, {
        clientConfiguration: thisResource.clientConfiguration,
        machineConfigurationInput: controlplane.machineConfiguration,
        endpoint: endpoint,
        node: range.key,
        configPatches: [notImplemented(`yamlencode({
cluster={
allowSchedulingOnControlPlanes=true
apiServer={
certSANs=local.cert_sans
}
extraManifests=[
"https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v\${local.ksca_version}/deploy/standalone-install.yaml"
]
}
machine={
install={
disk=each.value.install_disk
image=local.installer_image
}
network={
hostname=each.value.hostname
}
certSANs=local.cert_sans
kubelet={
extraArgs={
rotate-server-certificates=true
}
}
}
})`)],
    }));
}
const thisResource2: talos.index.MachineBootstrap[] = [];
for (const range = {value: 0}; range.value < allNodeData; range.value++) {
    thisResource2.push(new talos.index.MachineBootstrap(`this-${range.value}`, {
        clientConfiguration: thisResource.clientConfiguration,
        node: range.key,
        endpoint: endpoint,
    }));
}
const thisData = talos.index.clusterHealth({
    clientConfiguration: thisResource.clientConfiguration,
    controlPlaneNodes: .map(([, ]) => (k)),
    endpoints: [endpoint],
    timeouts: {
        read: healthTimeout,
    },
});
const thisData2 = talos.index.clusterKubeconfig({
    clientConfiguration: thisResource.clientConfiguration,
    node: .map(([, ]) => (k))[0],
    endpoint: endpoint,
    timeouts: {
        read: kubeconfigTimeout,
    },
});
export const talosconfig = _this.talosConfig;
export const kubeconfig = thisData2.kubeconfigRaw;
