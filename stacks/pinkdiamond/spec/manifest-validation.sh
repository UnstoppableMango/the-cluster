#!/bin/bash
set -eu

exitCode=0
root="$(git rev-parse --show-toplevel)/stacks/pinkdiamond"

echo -e "Running Pink Diamond tests\n"

manifests="$(kustomize build "$root/manifests")"

echo "It should set controlplane eth0 vip..."
controlplaneVipQuery='select(.kind == "TalosControlPlane") '\
'| .spec.controlPlaneConfig.controlplane.configPatches[] '\
'| select(.path == "/machine/network") '\
'| .value.interfaces[] '\
'| select(.interface == "eth0") '\
'| .vip.ip'

expectedVip="192.168.1.100"
actualVip="$(echo "$manifests" | yq -r "$controlplaneVipQuery")"

if [ "$actualVip" == "$expectedVip" ]; then
    echo -e "✅ TalosControlPlane set expected controlPlane vip!\n"
else
    echo -e "❌ TalosControlPlane did not have expected controlPlane vip!"
    echo -e "Expected: $expectedVip"
    echo -e "Actual:   $actualVip\n"
    exitCode=1
fi

echo "It should set init eth0 vip..."
initVipQuery='select(.kind == "TalosControlPlane") '\
'| .spec.controlPlaneConfig.init.configPatches[] '\
'| select(.path == "/machine/network") '\
'| .value.interfaces[] '\
'| select(.interface == "eth0") '\
'| .vip.ip'

actualVip="$(echo "$manifests" | yq -r "$initVipQuery")"

if [ "$actualVip" == "$expectedVip" ]; then
    echo -e "✅ TalosControlPlane set expected init vip!\n"
else
    echo -e "❌ TalosControlPlane did not have expected init vip!"
    echo -e "Expected: $expectedVip"
    echo -e "Actual:   $actualVip\n"
    exitCode=1
fi

talosVersion="$(cat $root/.versions | yq -r '."siderolabs/talos"')"
k8sVersion="$(cat $root/.versions | yq -r '."kubernetes/kubernetes"')"
sideroVersion="$(cat $root/.versions | yq -r '."siderolabs/sidero"')"

echo "It should set TalosControlPlane Talos version..."
actualTalosVersion="$(echo "$manifests" | yq -r 'select(.kind == "TalosControlPlane") | .spec.controlPlaneConfig.controlplane.talosVersion')"

if [ "$actualTalosVersion" == "v$talosVersion" ]; then
    echo -e "✅ TalosControlPlane set expected Talos version!\n"
else
    echo -e "❌ TalosControlPlane did not set expected Talos version!"
    echo -e "Expected: $talosVersion"
    echo -e "Actual:   $actualTalosVersion\n"
    exitCode=1
fi

echo "It should set TalosConfigTemplate Talos version..."
actualTalosVersion="$(echo "$manifests" | yq -r 'select(.kind == "TalosConfigTemplate") | .spec.template.spec.talosVersion')"

if [ "$actualTalosVersion" == "v$talosVersion" ]; then
    echo -e "✅ TalosConfigTemplate set expected Talos version!\n"
else
    echo -e "❌ TalosConfigTemplate did not set expected Talos version!"
    echo -e "Expected: $talosVersion"
    echo -e "Actual:   $actualTalosVersion\n"
    exitCode=1
fi

echo "It should set TalosControlPlane Kubernetes version..."
actualK8sVersion="$(echo "$manifests" | yq -r 'select(.kind == "TalosControlPlane") | .spec.version')"

if [ "$actualK8sVersion" == "v$k8sVersion" ]; then
    echo -e "✅ TalosControlPlane set expected Kubernetes version!\n"
else
    echo -e "❌ TalosControlPlane did not set expected Kubernetes version!"
    echo -e "Expected: $k8sVersion"
    echo -e "Actual:   $actualK8sVersion\n"
    exitCode=1
fi

echo "It should set MachineDeployment Kubernetes version..."
actualK8sVersion="$(echo "$manifests" | yq -r 'select(.kind == "MachineDeployment") | .spec.template.spec.version')"

if [ "$actualK8sVersion" == "v$k8sVersion" ]; then
    echo -e "✅ MachineDeployment set expected Kubernetes version!\n"
else
    echo -e "❌ MachineDeployment did not set expected Kubernetes version!"
    echo -e "Expected: $k8sVersion"
    echo -e "Actual:   $actualK8sVersion\n"
    exitCode=1
fi

echo "It should set Cluster name..."
expectedClusterName="pink-diamond"
actualClusterName="$(echo "$manifests" | yq -r 'select(.kind == "Cluster") | .metadata.name')"

if [ "$actualClusterName" == "$expectedClusterName" ]; then
    echo -e "✅ Cluster set expected name!\n"
else
    echo -e "❌ Cluster did not set expected name!"
    echo -e "Expected: $expectedClusterName"
    echo -e "Actual:   $actualClusterName\n"
    exitCode=1
fi

echo "It should set MetalCluster name..."
actualClusterName="$(echo "$manifests" | yq -r 'select(.kind == "MetalCluster") | .metadata.name')"

if [ "$actualClusterName" == "$expectedClusterName" ]; then
    echo -e "✅ MetalCluster set expected name!\n"
else
    echo -e "❌ MetalCluster did not set expected name!"
    echo -e "Expected: $expectedClusterName"
    echo -e "Actual:   $actualClusterName\n"
    exitCode=1
fi

echo "It should set MachineDeployment cluster name..."
actualClusterName="$(echo "$manifests" | yq -r 'select(.kind == "MachineDeployment") | .spec.clusterName')"

if [ "$actualClusterName" == "$expectedClusterName" ]; then
    echo -e "✅ MachineDeployment set expected name!\n"
else
    echo -e "❌ MachineDeployment did not set expected name!"
    echo -e "Expected: $expectedClusterName"
    echo -e "Actual:   $actualClusterName\n"
    exitCode=1
fi

echo "It should set resource namespaces..."
expectedNamespace="pink-diamond"
actualNamespaces="$(echo "$manifests" | yq -r '(.kind + ";" + .metadata.name + ";" + .metadata.namespace)')"

while read line; do
  IFS=';' read -ra parts <<< "$line"
  kind=${parts[0]}
  name=${parts[1]}
  actualNamespace=${parts[2]}

  if [ "$actualNamespace" == "$expectedNamespace" ]; then
      echo -e "✅ $kind $name set expected namespace!"
  else
      echo -e "❌ $kind $name did not set expected namespace!"
      echo -e "Expected: $expectedNamespace"
      echo -e "Actual:   $actualNamespace\n"
      exitCode=1
  fi
done <<< "$actualNamespaces"
echo ""

echo "It should set MetalMachineTemplate ServerClass..."
expectedServerClass="rpi"
actualServerClasses="$(echo "$manifests" | yq -r 'select(.kind == "MetalMachineTemplate") | (.metadata.name + ";" + .spec.template.spec.serverClassRef.name)')"

while read line; do
  IFS=';' read -ra parts <<< "$line"
  name=${parts[0]}
  actualServerClass=${parts[1]}

  if [ "$actualServerClass" == "$expectedServerClass" ]; then
      echo -e "✅ $name set expected ServerClass!"
  else
      echo -e "❌ $name did not set expected ServerClass!"
      echo -e "Expected: $expectedServerClass"
      echo -e "Actual:   $actualServerClass\n"
      exitCode=1
  fi
done <<< "$actualServerClasses"
echo ""

echo "It should set controlplane endpoint..."
expectedControlplaneEndpoint="192.168.1.100"
actualControlplaneEndpoint="$(echo "$manifests" | yq -r 'select(.kind == "MetalCluster") | .spec.controlPlaneEndpoint.host')"

if [ "$actualControlplaneEndpoint" == "$expectedControlplaneEndpoint" ]; then
    echo -e "✅ Controlplane had expected endpoint!\n"
else
    echo -e "❌ Controlplane did not have expected endpoint!"
    echo -e "Expected: $expectedControlplaneEndpoint"
    echo -e "Actual:   $actualControlplaneEndpoint\n"
    exitCode=1
fi

echo "It should set controlplane port..."
expectedControlplanePort="6444"
actualControlplanePort="$(echo "$manifests" | yq -r 'select(.kind == "MetalCluster") | .spec.controlPlaneEndpoint.port')"

if [ "$actualControlplanePort" == "$expectedControlplanePort" ]; then
    echo -e "✅ Controlplane had expected port!\n"
else
    echo -e "❌ Controlplane did not have expected port!"
    echo -e "Expected: $expectedControlplanePort"
    echo -e "Actual:   $actualControlplanePort\n"
    exitCode=1
fi

echo "It should set number of controlplane nodes..."
expectedControlplaneNodes="3"
actualControlplaneNodes="$(echo "$manifests" | yq -r 'select(.kind == "TalosControlPlane") | .spec.replicas')"

if [ "$actualControlplaneNodes" == "$expectedControlplaneNodes" ]; then
    echo -e "✅ Controlplane had expected number of nodes!\n"
else
    echo -e "❌ Controlplane did not have expected number of nodes!"
    echo -e "Expected: $expectedControlplaneNodes"
    echo -e "Actual:   $actualControlplaneNodes\n"
    exitCode=1
fi

echo "It should set number of worker nodes..."
expectedWorkerNodes="2"
actualWorkerNodes="$(echo "$manifests" | yq -r 'select(.kind == "MachineDeployment") | .spec.replicas')"

if [ "$actualWorkerNodes" == "$expectedWorkerNodes" ]; then
    echo -e "✅ Had expected number of worker nodes!\n"
else
    echo -e "❌ Did not have expected number of worker nodes!"
    echo -e "Expected: $expectedWorkerNodes"
    echo -e "Actual:   $actualWorkerNodes\n"
    exitCode=1
fi

exit $exitCode
