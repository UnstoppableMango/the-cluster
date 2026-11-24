# nix-system

See [docs/ncps.md](../../docs/ncps.md) for operating ncps.

## Measurements

- Postgres measured 12m CPU idle and a working set around 300Mi under CI load, with a sampled peak of 501Mi over a week.
  The memory limit is twice that peak.
- ncps tails a NAR another replica is still fetching in 8 MiB parts.
  At the 30s default `--cache-cdc-chunk-wait-timeout`, a part fetched upstream under about 280 KB/s cut the stream.
- RGW regularly takes longer than the 5s default `--cache-storage-stat-timeout` to answer a bucket HEAD.
- `--cache-database-pool-max-open-conns=10` is twice the idle pool a replica keeps, against a default of 25 per replica.
- `GOMEMLIMIT` sits at about 80% of the container memory limit.
- The upstream narinfo timeouts default to 3s; 2s still leaves a slow cachix enough time to answer.
