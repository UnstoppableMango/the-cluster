# Nested containers

The `nested-containers` RuntimeClass is for pods that run their own container runtime: dockerd, podman, buildkitd, kind.
It replaces `privileged: true` for that purpose.
The pod runs in a user namespace, so root inside it, including the nested runtime, is an unprivileged uid on the node.

The manifests are in `infrastructure/configs/nested-containers/`.

## Why a RuntimeClass

A container runtime needs to create cgroups for the containers it starts.
containerd mounts `/sys/fs/cgroup` read-only in unprivileged containers, and dockerd fails at startup with `mkdir: can't create directory '/sys/fs/cgroup/init': Read-only file system`.
`privileged: true` makes the mount writable, but a privileged container runs in the host user namespace, where root is root on the node.
Combining `privileged: true` with `hostUsers: false` does not help either: containerd then shares the host's root cgroup with the container.

The class selects the containerd handler `runc-cgroup-writable`, which is runc with `cgroup_writable = true`.
It mounts `/sys/fs/cgroup` read-write in unprivileged containers, and runc delegates the pod's cgroup to the user namespace's root.

## Pod contract

A ValidatingAdmissionPolicy rejects a pod with `runtimeClassName: nested-containers` unless:

- `spec.hostUsers` is `false`
- no container, init container, or ephemeral container sets `privileged: true`

## dind recipe

`apps/claude/deployment.yml` runs dockerd as a native sidecar with this shape:

```yaml
spec:
  runtimeClassName: nested-containers
  hostUsers: false
  initContainers:
    - name: dind
      image: docker:<version>-dind
      args: [dockerd, --host=unix:///run/docker/docker.sock]
      restartPolicy: Always
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        allowPrivilegeEscalation: true
        capabilities:
          add: ["ALL"]
        seccompProfile:
          type: Unconfined
        appArmorProfile:
          type: Unconfined
        # Nested containers mount a /proc of their own, which the masked
        # default /proc forbids.
        procMount: Unmasked
```

The capabilities and the unconfined profiles apply only inside the pod's namespaces.
Other containers reach dockerd through a shared `emptyDir` at `/run/docker` and `DOCKER_HOST=unix:///run/docker/docker.sock`.

## Node configuration

Every rosequartz kubelet node defines the `runc-cgroup-writable` handler, so the class has no `scheduling` section.
It is set in `UnstoppableMango/nixos` through `kubelet.extraModules` in `clan/rosequartz-cluster.nix`:

```nix
virtualisation.containerd.settings.plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc-cgroup-writable = {
  runtime_type = "io.containerd.runc.v2";
  cgroup_writable = true;
  options.SystemdCgroup = true;
};
```

That override moves into cairn once it can declare runtime handlers (UnstoppableMango/cairn#96).
