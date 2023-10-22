terraform {
  cloud {
    organization = "UnstoppableMango"

    workspaces {
      tags = ["rosequartz"]
    }
  }
}
