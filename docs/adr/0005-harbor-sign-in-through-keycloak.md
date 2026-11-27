# Harbor signs people in through Keycloak

Harbor's authentication mode can only change while no user other than `admin` exists in its database, so this is decided before anyone else signs in.
Harbor uses OIDC against the `thecluster` realm, through a `harbor` client declared in UnstoppableMango/iam.
Sign-in is gated on a `harbor-user` realm role, held by `harbor-users` and `harbor-admins`, because Harbor onboards anyone who passes OIDC and a Member with no groups would otherwise get an account.
`harbor-admins` is Harbor's OIDC admin group, and `docker login` uses the CLI secret Harbor issues to each signed-in person.

## Consequences

- Going back to database auth means deleting every OIDC user first, so reversing this costs every person's account and project memberships.
- `admin` stays a local account and becomes the break-glass admin, kept in Key Vault and used by nothing (see [0006](0006-operator-is-harbors-only-admin.md)).
