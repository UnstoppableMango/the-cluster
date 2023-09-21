terraform {
  cloud {
    organization = "UnstoppableMango"

    workspaces {
      tags = ["rosequartz"]
    }
  }
  required_providers {
    talos = {
      source  = "siderolabs/talos"
      version = "0.4.0-alpha.0"
    }
  }
}
