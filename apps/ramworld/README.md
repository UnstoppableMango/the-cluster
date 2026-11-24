# ramworld

See [docs/ramworld.md](../../docs/ramworld.md) for the experiment itself.

## Measurements

- The game install is 4.6Gi, written by steamcmd on first boot and updated in place.
- The world save is 6Mi. The 2Gi ramdisk `sizeLimit` is headroom for a session's growth and the rolling backup directory the game keeps beside it.
- CPU requests carry over from adventureworld's two-player baseline: about 3.2 CPU median, peaking past 4.
- The memory limit is adventureworld's 16Gi plus the ramdisk, so it exceeds what any Pi node has.
