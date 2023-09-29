terraform {
  required_providers {
    talos = {
      source  = "siderolabs/talos"
      version = "0.4.0-alpha.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "talos" {}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
