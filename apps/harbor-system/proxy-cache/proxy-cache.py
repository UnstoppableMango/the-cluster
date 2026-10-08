"""Create Harbor's proxy-cache registries and projects if they are missing.

Run by cron-job.yml. Each entry becomes a registry endpoint and a public
project of the same name that proxies it, so a node pulls
docker.io/library/nginx as harbor.thecluster.lan/dockerhub/library/nginx.
Existing registries and projects are left as they are: this only adds,
so a setting changed in the UI survives the next run.
"""

import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "http://harbor-core.harbor-system.svc/api/v2.0"

# Project name -> (adapter type, upstream URL). The node mirrors in
# UnstoppableMango/nixos map each upstream host to these project names, so
# renaming one here means renaming it there too.
CACHES = {
    "dockerhub": ("docker-hub", "https://hub.docker.com"),
    "ghcr": ("github-ghcr", "https://ghcr.io"),
    "quay": ("quay", "https://quay.io"),
    "k8s": ("docker-registry", "https://registry.k8s.io"),
}

token = base64.b64encode(
    f"admin:{os.environ['HARBOR_ADMIN_PASSWORD']}".encode()
).decode()


def call(method, path, body=None):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={
            "Authorization": f"Basic {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        return json.loads(data) if data else None


def registry_id(name):
    query = urllib.parse.quote(f"name={name}")
    found = [r for r in call("GET", f"/registries?q={query}") if r["name"] == name]
    return found[0]["id"] if found else None


def project_exists(name):
    query = urllib.parse.quote(name)
    try:
        call("HEAD", f"/projects?project_name={query}")
        return True
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        raise


failed = False
for project, (kind, url) in CACHES.items():
    try:
        rid = registry_id(project)
        if rid is None:
            call("POST", "/registries", {"name": project, "type": kind, "url": url})
            rid = registry_id(project)
            print(f"created registry {project} ({url})")
        if not project_exists(project):
            call(
                "POST",
                "/projects",
                {
                    "project_name": project,
                    "registry_id": rid,
                    # containerd pulls anonymously, so the caches are public.
                    "metadata": {"public": "true"},
                },
            )
            print(f"created proxy-cache project {project}")
    except urllib.error.HTTPError as e:
        print(f"{project}: {e.code} {e.read().decode(errors='replace')}", file=sys.stderr)
        failed = True

sys.exit(1 if failed else 0)
