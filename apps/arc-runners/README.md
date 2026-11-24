# arc-runners

## Measurements

These numbers size the runner template in `helm-release.yml`, and `apps/unmango-runners` and `charts/arc-runner-scale-set` share them.

- An idle runner uses about 1m CPU and 60Mi.
  When requests matched the limits, each replica reserved 8 cores and runners doing nothing filled gaea.
- `init-dind-externals` copies about 600 MB of node runtimes.
- One full realisation of the-cluster's devShell is 8.7Gi and 3712 store paths.
  An idle runner's store holds about 20K, and a tdl runner held 4.2Gi mid-job.
  10Gi is not enough, because pulumi and its provider plugins run a devShell out of space partway.
- Unbounded fan-out put 39 runners on one node (#4436).
  At the former 75Gi nix volume, 39 of them overcommit the whole default-ssd pool.
  runc's `openat2` gives up after a 2ms retry deadline while the mount table changes, which is what broke dind.
- dotfiles runs two runners at 50Gi, which keeps the fast-rwo ceiling below six at 20Gi.
