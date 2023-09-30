variable "talos_version" {
  description = "The version of talos to use"
  type        = string
  default     = null
}

variable "k8s_version" {
  description = "The version of kubernetes to use"
  type        = string
  default     = null
}

variable "cluster_name" {
  description = "A name to provide for the Talos cluster"
  type        = string
  default     = "rosequartz"
}

variable "primary_dns_name" {
  description = "The primary DNS name to use"
  type        = string
  default     = null
}

variable "public_ip" {
  description = "The public IP used for the Talos cluster"
  type        = string
  default     = "10.5.0.2"
}

variable "cert_sans" {
  description = "Subject Alternative Names to use for certificates"
  type        = list(string)
  default     = ["10.5.0.2"]
}

variable "node_data" {
  description = "A map of node data"
  type = object({
    controlplanes = map(object({
      install_disk = string
      hostname     = string
    }))
    workers = map(object({
      install_disk = string
      hostname     = string
    }))
  })
  default = {
    controlplanes = {
      "10.5.0.2" = {
        install_disk = "/dev/sda"
        hostname     = "rqctrl1"
      }
    }
    workers = {}
  }
}

variable "health_timeout" {
  description = "Timeout for the health operation"
  type        = string
  default     = "4m"
}

variable "kubeconfig_timeout" {
  description = "Timeout for the kubeconfig operation"
  type        = string
  default     = "30s"
}
