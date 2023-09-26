locals {
  k8s_version     = coalesce(var.k8s_version, trim(file(".versions/k8s"), "\n"))
  talos_version   = coalesce(var.talos_version, "v${trim(file(".versions/talos"), "\n")}")
  installer_image = "ghcr.io/siderolabs/installer:${local.talos_version}"
}

resource "talos_machine_secrets" "this" {
  talos_version = local.talos_version
}

data "talos_machine_configuration" "controlplane" {
  cluster_name       = var.cluster_name
  cluster_endpoint   = var.cluster_endpoint
  machine_type       = "controlplane"
  machine_secrets    = talos_machine_secrets.this.machine_secrets
  talos_version      = local.talos_version
  kubernetes_version = local.k8s_version
}

data "talos_client_configuration" "this" {
  cluster_name         = var.cluster_name
  client_configuration = talos_machine_secrets.this.client_configuration
  endpoints            = [for k, v in var.node_data.controlplanes : k]
}

resource "talos_machine_configuration_apply" "controlplane" {
  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.controlplane.machine_configuration
  for_each                    = var.node_data.controlplanes
  node                        = each.key
  config_patches = [
    yamlencode({
      cluster = {
        allowSchedulingOnControlPlanes = true
        apiServer = {
          certSANs = var.cert_sans
        }
      }
      machine = {
        install = {
          disk  = each.value.install_disk
          image = local.installer_image
        }
        network = {
          hostname = each.value.hostname
        }
        certSANs = var.cert_sans
      }
    })
  ]
}

resource "talos_machine_bootstrap" "this" {
  depends_on = [talos_machine_configuration_apply.controlplane]

  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = [for k, v in var.node_data.controlplanes : k][0]
}

data "talos_cluster_health" "this" {
  depends_on = [talos_machine_bootstrap.this]

  client_configuration = talos_machine_secrets.this.client_configuration
  control_plane_nodes  = [for k, v in var.node_data.controlplanes : k]
  endpoints            = [for k, v in var.node_data.controlplanes : k]
  timeouts = {
    read = var.health_timeout
  }
}

data "talos_cluster_kubeconfig" "this" {
  depends_on = [talos_machine_bootstrap.this]

  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = [for k, v in var.node_data.controlplanes : k][0]
  timeouts = {
    read = var.kubeconfig_timeout
  }
}
