# claude

## Measurements

- Sessions are mostly idle, at about 0.5Gi each with their MCP servers.
- Seven sessions measured 1.9Gi at rest.
- Builds (go, cargo, tsc, dotnet, nix evaluation) run in the claude container and take gigabytes each.
  Peaks under load have not been measured, so the 48Gi limit is generous.
