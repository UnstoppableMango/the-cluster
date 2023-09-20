variable "talos_version" {
  description = "The version of talos to use"
  type        = string
  default     = "v1.5.2"
}

variable "k8s_version" {
  description = "The version of kubernetes to use"
  type        = string
  default     = "1.28.1"
}

variable "cluster_name" {
  description = "A name to provide for the Talos cluster"
  type        = string
  default     = "rosequartz"
}

variable "cluster_endpoint" {
  description = "The endpoint for the Talos cluster"
  type        = string
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
