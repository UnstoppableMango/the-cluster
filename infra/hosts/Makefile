export WORKING_DIR := $(shell git rev-parse --show-toplevel)
export PROJECT_DIR := ${WORKING_DIR}/infra/hosts

K8S_VERSION := $(shell pulumi config get --path 'versions.krel')
K8S_URL     := https://raw.githubusercontent.com/kubernetes/release

.PHONY: containerd kubelet kubeadm
containerd: containerd/config.toml.patch
kubelet: kubelet/kubelet.service.patch
kubeadm: kubeadm/10-kubeadm.conf.patch

# Containerd
containerd/config.toml.patch: containerd/default_config.toml containerd/config.toml
	diff containerd/default_config.toml containerd/config.toml | tee $@

containerd/default_config.toml:
	containerd config default > $@

# Kubelet
kubelet/kubelet.service: kubelet/kubelet_default.service
	cat kubelet/kubelet_default.service | sed "s:/usr/bin:/usr/local/bin:g" > $@

kubelet/kubelet.service.patch: kubelet/kubelet_default.service kubelet/kubelet.service
	diff kubelet/kubelet_default.service kubelet/kubelet.service | tee $@

kubelet/kubelet_default.service: Pulumi.yaml
	curl -sSL "${K8S_URL}/v${K8S_VERSION}/cmd/krel/templates/latest/kubelet/kubelet.service" > $@

# Kubeadm
kubeadm/10-kubeadm.conf: kubeadm/10-kubeadm_default.conf
	cat kubeadm/10-kubeadm_default.conf | sed "s:/usr/bin:/usr/local/bin:g" > $@

kubeadm/10-kubeadm.conf.patch: kubeadm/10-kubeadm_default.conf kubeadm/10-kubeadm.conf
	diff kubeadm/10-kubeadm_default.conf kubeadm/10-kubeadm.conf | tee $@

kubeadm/10-kubeadm_default.conf: Pulumi.yaml
	curl -sSL "${K8S_URL}/v${K8S_VERSION}/cmd/krel/templates/latest/kubeadm/10-kubeadm.conf" > $@
