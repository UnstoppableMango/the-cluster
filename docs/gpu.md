# GPUs

apollo has an NVIDIA GeForce GTX 1060 6GB (GP106, Pascal), the only GPU in rosequartz.
Pods reach it through the `nvidia` RuntimeClass and the `nvidia.com/gpu` extended resource.
The manifests are in `infrastructure/controllers/nvidia-system/`.

## Pod recipe

```yaml
spec:
  runtimeClassName: nvidia
  containers:
    - name: cuda
      image: nvcr.io/nvidia/cuda:12.9.1-base-ubuntu24.04
      resources:
        limits:
          nvidia.com/gpu: 1
```

Both halves are needed.
The resource limit is what the device plugin allocates against and what sets `NVIDIA_VISIBLE_DEVICES` to the GPU's UUID.
The RuntimeClass is what reads that variable and mounts the device nodes, the driver libraries and `nvidia-smi` into the container; without it the container starts with no GPU at all.
The class also schedules the pod onto apollo, through its `nvidia.com/gpu.present` node selector.

The driver is the 580 branch, the last to support Pascal.
CUDA 13 dropped Pascal as a target, so images must be built against CUDA 12.

There is one GPU and no time-slicing, so one pod at a time holds it.

## Node configuration

The host side is in `UnstoppableMango/nixos`, `machines/apollo/configuration.nix`:

- the proprietary 580 driver (`hardware.nvidia.branch = "legacy_580"`, `open = false`) with `nvidia-persistenced`
- `hardware.nvidia-container-toolkit`, which writes a CDI spec to `/run/cdi` on boot, naming devices by UUID to match what the device plugin hands out
- a containerd handler `nvidia`: runc behind `nvidia-container-runtime.cdi`, which resolves `NVIDIA_VISIBLE_DEVICES` against that spec

`clan/rosequartz-cluster.nix` labels apollo `nvidia.com/gpu.present=true`.
The device plugin chart's default affinity selects on that label, and the plugin itself runs under the `nvidia` class, since it needs NVML from the host.
