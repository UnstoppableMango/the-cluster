terraform {
  cloud {
    organization = "UnstoppableMango"

    workspaces {
      name = "rosequartz"
    }
  }
  required_providers {
    talos = {
      source = "siderolabs/talos"
      version = "0.4.0-alpha.0"
    }
  }
}
