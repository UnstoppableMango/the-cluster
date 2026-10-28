# Nextcloud has one canonical hostname, resolved per entry point

Nextcloud is reached on the LAN and through the Cloudflare tunnel, but unlike Gitea (`gitea.thecluster.lan` plus `gitea.thecluster.io`) it gets a single name under `thecluster.io`.
Its desktop and mobile clients store one server URL, so two names would mean one account per network.
On the LAN, Pi-hole points the name at the nginx Gateway, which serves a Let's Encrypt certificate; elsewhere it resolves to the tunnel.
Tailscale becomes a third entry point under the same name rather than a third hostname.
