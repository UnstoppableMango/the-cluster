locals {
  k8s_version      = yamldecode(file(".versions"))["kubernetes/kubernetes"]
  talos_version    = yamldecode(file(".versions"))["siderolabs/talos"]
  ksca_version     = yamldecode(file(".versions"))["alex1989hu/kubelet-serving-cert-approver"]
  installer_image  = "ghcr.io/siderolabs/installer:v${local.talos_version}"
  all_node_data    = merge(var.node_data.controlplanes, var.node_data.workers)
  zone_id          = "22f1d42ba0fbe4f924905e1c6597055c"
  endpoint         = coalesce(var.primary_dns_name, var.public_ip)
  cluster_endpoint = "https://${local.endpoint}:6443"
  cert_sans        = concat([var.public_ip, local.endpoint], var.cert_sans)
}

resource "cloudflare_record" "primary_dns" {
  count = terraform.workspace == "rosequartz-prod" ? 1 : 0

  name    = var.primary_dns_name
  zone_id = local.zone_id
  type    = "A"
  value   = var.public_ip
  proxied = false
}

resource "cloudflare_ruleset" "ssl" {
  count = terraform.workspace == "rosequartz-prod" ? 1 : 0

  name        = "${var.primary_dns_name} SSL"
  description = "Set SSL to a value that works for ${var.primary_dns_name}"
  kind        = "zone"
  zone_id     = local.zone_id
  phase       = "http_config_settings"
  rules {
    action = "set_config"
    action_parameters {
      ssl = "full"
    }
    expression = "(http.host eq \"${var.primary_dns_name}\") or (http.host eq \"pd.thecluster.io\")"
  }
}

resource "talos_machine_secrets" "this" {
  talos_version = "v${local.talos_version}"
}

data "talos_machine_configuration" "controlplane" {
  cluster_name       = var.cluster_name
  cluster_endpoint   = local.cluster_endpoint
  machine_type       = "controlplane"
  machine_secrets    = talos_machine_secrets.this.machine_secrets
  docs               = false
  examples           = false
  talos_version      = "v${local.talos_version}"
  kubernetes_version = local.k8s_version
}

data "talos_client_configuration" "this" {
  cluster_name         = var.cluster_name
  client_configuration = talos_machine_secrets.this.client_configuration
  endpoints            = [local.endpoint]
  nodes                = [for k, v in local.all_node_data : k]
}

resource "talos_machine_configuration_apply" "controlplane" {
  depends_on = [cloudflare_record.primary_dns]

  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.controlplane.machine_configuration
  endpoint                    = local.endpoint
  for_each                    = var.node_data.controlplanes
  node                        = each.key
  config_patches = [
    yamlencode({
      cluster = {
        allowSchedulingOnControlPlanes = true
        apiServer = {
          certSANs = local.cert_sans
        }
        extraManifests = [
          "https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${local.ksca_version}/deploy/standalone-install.yaml"
        ]
      }
      machine = {
        install = {
          disk  = each.value.install_disk
          image = local.installer_image
        }
        network = {
          hostname = each.value.hostname
        }
        certSANs = local.cert_sans
        kubelet = {
          extraArgs = {
            rotate-server-certificates = true
          }
        }
      }
    })
  ]
}

resource "talos_machine_bootstrap" "this" {
  depends_on = [talos_machine_configuration_apply.controlplane]

  client_configuration = talos_machine_secrets.this.client_configuration
  for_each             = local.all_node_data
  node                 = each.key
  endpoint             = local.endpoint
}

data "talos_cluster_health" "this" {
  depends_on = [talos_machine_bootstrap.this]

  client_configuration = talos_machine_secrets.this.client_configuration
  control_plane_nodes  = [for k, v in var.node_data.controlplanes : k]
  endpoints            = [local.endpoint]
  timeouts = {
    read = var.health_timeout
  }
}

data "talos_cluster_kubeconfig" "this" {
  depends_on = [talos_machine_bootstrap.this]

  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = [for k, v in var.node_data.controlplanes : k][0]
  endpoint             = local.endpoint
  timeouts = {
    read = var.kubeconfig_timeout
  }
}
