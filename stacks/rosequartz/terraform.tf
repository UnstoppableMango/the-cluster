terraform {
  cloud {
    organization = "UnstoppableMango"

    workspaces {
      name = "rosequartz-prod"
    }
  }
}
