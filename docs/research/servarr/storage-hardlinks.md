# Hardlink-friendly media storage on rosequartz CephFS

Research for UnstoppableMango/the-cluster#4820, "Research hardlink-friendly storage on CephFS".

**Question.** Can downloads and the media library share one filesystem on rosequartz's Rook CephFS, so Sonarr and Radarr import by hardlink or atomic move instead of copying? How would the existing claims get there?

**Short answer.** Yes, but not across the claims as they are now.
Every library and download claim is its own ceph-csi **subvolume**.
The Ceph MDS refuses `link()` and `rename()` between two subvolumes with `EXDEV`, so hardlinks and moves between them fail, and the *arr apps fall back to copying.
A hardlink or rename works between any two directories inside one subvolume, and between data pools or file layouts.
Mounting a common parent directory with a static PV does not help while the children are still subvolumes.
Three ways to converge without re-copying everything are compared under [Ways to converge](#ways-to-converge).

Researched 2026-11-02 against the-cluster `main` at `f72be58`, Ceph `main` and `squid` (rosequartz runs `quay.io/ceph/ceph:v19.2.5`), ceph-csi `devel`, Rook `master` (rosequartz runs v1.18.11), Linux `master`, the Servarr wiki and TRaSH Guides `master`.

## 1. What the Servarr wiki and TRaSH Guides recommend, and why

- **One filesystem, one mount, the same paths in every container.**
  The Servarr Docker Guide says that passing separate volumes like `/tv`, `/movies` and `/downloads` "makes them look like two different file systems, even if they are a single file system outside the container. This means hard links won't work *and* instead of an instant/atomic move, a slower and more IO intensive copy+delete is used."
  It recommends one `/data` layout used by every container ([Servarr wiki, docker-guide.md, "Consistent and well planned paths"](https://wiki.servarr.com/docker-guide#consistent-and-well-planned-paths)).
- **Layout.** `data/{torrents,usenet}/{movies,music,tv}` next to `data/media/{movies,music,tv}`.
  The torrent client gets only `data/torrents`, the media server only `data/media`, and Sonarr, Radarr and Lidarr get all of `data`, "because the *download* folder(s) and *media* folder will look like and *be* one file system. Hard links will work and moves will be atomic" (same page, "Sonarr, Radarr and Lidarr").
  TRaSH uses the same tree, adding `usenet/{incomplete,complete}` ([TRaSH Guides, `includes/file-and-folder-structure/docker-tree-full.md`](https://trash-guides.info/File-and-Folder-Structure/)).
- **The paths match inside and out.** Each container is "granted access to the required lowest-level folder while maintaining consistent pathing to the top-level folder", so the torrent client sees `/data/torrents` at the same path Sonarr does ([TRaSH, File and Folder Structure](https://trash-guides.info/File-and-Folder-Structure/)).
  Using the same path in both "means it will all just work. If you don't, you'd need to fix it with a remote path map" (Servarr docker-guide).
- **Why it matters.** A hardlink lets a torrent keep seeding from `torrents/` while the library holds a second name for the same blocks, so no extra space is used. An atomic move is an instant rename instead of copy and delete.
  TRaSH lists the limits: "You CAN'T hardlink across separate file systems, partitions, volumes or mounts" ([TRaSH, Hardlinks and Instant Moves](https://trash-guides.info/File-and-Folder-Structure/Hardlinks-and-Instant-Moves/)).
- **What happens when it fails.** Sonarr tries `TryCreateHardLink` and on failure logs `Hardlinking from '…' to '…' failed, fallback to copy.` ([Sonarr `src/NzbDrone.Common/Disk/DiskTransferService.cs`](https://github.com/Sonarr/Sonarr/blob/v5-develop/src/NzbDrone.Common/Disk/DiskTransferService.cs), lines 321–333).
  The Sonarr settings page says the same: "The file system and mounts must be the same for your completed download directory and your media library. If the hard link creation fails … Sonarr will fall back and copy the file" ([Servarr wiki, sonarr/settings.md](https://wiki.servarr.com/sonarr/settings)).
  So the failure is silent apart from that log line: imports still work, they just use double the space and I/O.

The Servarr guide also says "there are other reasonable ways of arranging things too … What matters here is the general structure, not the names."
The requirement underneath is narrower than "one `/data` for everything": **for each importer, the download directory and the library directory must be reachable through one mount of one filesystem, and on CephFS (below) inside one subvolume.**

## 2. What CephFS allows

### Two mounts are two filesystems to the kernel, whatever is behind them

Linux checks `old_path.mnt != new_path.mnt` and returns `-EXDEV` in both `filename_linkat` and `filename_renameat2` ([linux `fs/namei.c`](https://github.com/torvalds/linux/blob/master/fs/namei.c), lines ~6001 and ~6295).
Two PVCs mounted into one pod are two mounts even if they point into the same CephFS, so they can never hardlink or rename into each other.
This is the mechanism behind the Servarr wiki's "two volumes look like two file systems".

### Across subvolumes: refused by the MDS

- `ceph fs subvolume create` marks the subvolume directory with the `ceph.dir.subvolume` vxattr (mgr/volumes `subvolume_v2.py` sets it on `base_path`, `subvolume_v1.py` on the subvolume path; [ceph `src/pybind/mgr/volumes/fs/operations/versions/`](https://github.com/ceph/ceph/tree/main/src/pybind/mgr/volumes/fs/operations/versions)).
- In the MDS, `handle_client_link` fails a hardlink whose target is in a different subvolume: `if (target_pin != dir->inode && target_realm->get_subvolume_ino() != dir->inode->find_snaprealm()->get_subvolume_ino() && !target_pin->is_stray()) { … "target is in different subvolume, failing..."; respond_to_request(mdr, -EXDEV); }` ([ceph `src/mds/Server.cc`](https://github.com/ceph/ceph/blob/main/src/mds/Server.cc), ~line 7980; the same check is at ~7678 on the `squid` branch).
- `handle_client_rename` does the same for renames: `if (src_realm != dest_realm && src_realm->get_subvolume_ino() != dest_realm->get_subvolume_ino()) respond_to_request(mdr, -EXDEV);` (same file, ~9593; ~9259 on `squid`).
- So it does not matter whether the client mounts a common parent. The subvolume boundary is enforced server-side, for every client.

### Across quota realms: rename refused by the kernel client, hardlink not

- The kernel CephFS client refuses rename between directories in different quota realms: `/* don't allow cross-quota renames */ if ((old_dir != new_dir) && (!ceph_quota_is_same_realm(old_dir, new_dir))) return -EXDEV;` ([linux `fs/ceph/dir.c`, `ceph_rename`](https://github.com/torvalds/linux/blob/master/fs/ceph/dir.c)).
  A quota realm is the nearest ancestor that has a `ceph.quota.*` set ([linux `fs/ceph/quota.c`, `get_quota_realm`](https://github.com/torvalds/linux/blob/master/fs/ceph/quota.c)).
- `ceph_link` in the same file has no quota check, and the MDS link check above looks only at subvolumes. So **hardlinks still work across quota realms inside one subvolume, but atomic moves do not.**
- ceph-csi provisions every subvolume with `--size`, which mgr/volumes stores as `ceph.quota.max_bytes` (`subvolume_base.py`), so each existing claim is its own quota realm as well as its own subvolume.
- Consequence for a new layout: **do not set a quota on `torrents/`, `media/` or any directory between them**, or moves (the usenet import path, and Sonarr's own renames between folders) degrade to copy. The quota on the subvolume itself covers both and is harmless.

### Inside one subvolume: no restriction

Two directories in the same subvolume share a subvolume inode and, with no inner quotas, a quota realm, so both checks pass and `link()`/`rename()` are ordinary metadata operations.

### Across data pools and file layouts: allowed, and the file stays where it was written

- "Files inherit the layout of their parent directory at creation time. However, subsequent changes to the parent directory's layout do not affect children" ([Ceph docs, File layouts, "Inheritance of layouts"](https://docs.ceph.com/en/latest/cephfs/file-layouts/)). A file's layout can only be changed while it is empty (same page).
- Neither the MDS link nor rename path checks pools or layouts (only subvolume and, in the client, quota realm, as quoted above).
- So a hardlink or move between a `standard` directory and a `data` (EC) directory **in the same subvolume** succeeds, and the file's objects stay in the pool they were written to.
  An import never moves data between pools; a file downloaded onto the EC pool stays on the EC pool even if its library directory's layout points at `erasure-coded-standard`.
- Across the two **filesystems** (`replicated` and `erasure-coded`) there is no link or rename at all: they are separate MDS namespaces and always separate mounts.

### No subvolume move or merge

mgr/volumes has no command to move a subvolume into another subvolume or into another group, or to merge two.
The only data-moving primitive is `ceph fs subvolume snapshot clone`, which "is an asynchronous operation that copies data from a snapshot to a subvolume … it is slow for" large data ([Ceph docs, FS volumes and subvolumes, "Cloning Snapshots"](https://docs.ceph.com/en/latest/cephfs/fs-volumes/)), so it costs the same as a copy.

## 3. What a ceph-csi static PV can mount

- A static CephFS PV takes `staticVolume: "true"`, `fsName`, `clusterID` and `rootPath`, where `rootPath` is "Actual path of the subvolume in ceph cluster … or folder path of the volume". `persistentVolumeReclaimPolicy` must be `Retain`, and ceph-csi does not snapshot, clone, resize or delete static PVs ([ceph-csi `docs/static-pvc.md`, "CephFS static PVC"](https://github.com/ceph/ceph-csi/blob/devel/docs/static-pvc.md)).
- In the source, `NewVolumeOptionsFromStaticVolume` takes `rootPath` verbatim as an option with no check that it is a subvolume ([ceph-csi `internal/cephfs/store/volumeoptions.go`](https://github.com/ceph/ceph-csi/blob/devel/internal/cephfs/store/volumeoptions.go)). So **any directory works: a subvolume path (`/volumes/csi/csi-vol-…/<uuid>`), a path inside one (`…/<uuid>/media/tv`), the group directory `/volumes/csi`, or a plain directory outside `/volumes`.**
- Static volumes authenticate with `userID`/`userKey` from the node-stage secret, not admin keys (`getCredentialsForVolume` in [`internal/cephfs/nodeserver.go`](https://github.com/ceph/ceph-csi/blob/devel/internal/cephfs/nodeserver.go)).
  Rook's `rook-csi-cephfs-node` secret carries `userID`/`userKey` for `client.csi-cephfs-node`, which has `mds allow rw` with no path restriction ([rook `pkg/operator/ceph/csi/secrets.go`](https://github.com/rook/rook/blob/master/pkg/operator/ceph/csi/secrets.go)), so the secret `pvs.yml` already uses works for static PVs.
- Rook documents exactly this use: copy an existing dynamic CephFS PV to a new name and `volumeHandle`, add `staticVolume: "true"` and `rootPath` equal to the original `subvolumePath`, and bind a second PVC to it. Resizing and similar operations "must [be made] on the original PVC" ([Rook docs, "Shared volume creation"](https://rook.io/docs/rook/latest/Storage-Configuration/Shared-Filesystem-CephFS/filesystem-storage/)).
- A pod-level `volumeMounts[].subPath` reaches a directory inside any PVC, static or dynamic, without a new PV.

What a static PV **cannot** do is make two subvolumes one: mounting `/volumes/csi` puts every `csi-vol-*` under one mount, but the MDS check in section 2 still refuses link and rename between them.

## 4. What backs the current claims

From `apps/media/pvs.yml`, `pvcs.yml`, `legacy-pvcs.yml`, `qbittorrent-downloads-pvc.yml`, `deluge-downloads-pvc.yml`, `infrastructure/configs/rook-ceph/storage/cephfs.yml`, and `docs/storage.md` (subvolume inventory):

| Claim | Class | Filesystem | Data pool | Subvolume (group `csi`) | Quota (PV size) | Used |
| --- | --- | --- | --- | --- | --- | --- |
| `movies` | `bulk-rwx` | `erasure-coded` | `erasure-coded-data` (EC 2+1) | `csi-vol-546ee57b-…` | 20Ti | 14.5 TiB |
| `movies4k` | `bulk-rwx` | `erasure-coded` | `erasure-coded-data` | `csi-vol-48d51b52-…` | 10Ti | 2.7 TiB |
| `tv` | `bulk-rwx` | `erasure-coded` | `erasure-coded-data` | `csi-vol-960fb57d-…` | 20Ti | 16.9 TiB |
| `tv4k` | `bulk-rwx` | `erasure-coded` | `erasure-coded-data` | `csi-vol-f29db30d-…` | 10Ti | 544 GiB |
| `anime` | `default-cephfs` (deprecated) | **`replicated`** | `replicated-data` | `csi-vol-7e86bc67-…` | 10Ti | 13 GiB, 10 files; `docs/storage.md` counts the copy as incomplete |
| `qbittorrent-downloads` | `ec-cephfs` (deprecated, **reclaim `Delete`**) | `erasure-coded` | `erasure-coded-data` | dynamic; not in `pvs.yml`, not in the inventory | 2Ti | unknown |
| `deluge-downloads` | `ec-cephfs` (deprecated, **reclaim `Delete`**) | `erasure-coded` | `erasure-coded-data` | dynamic; not in `pvs.yml`, not in the inventory | 2Ti | unknown |

Also relevant: `music` is on the `replicated` filesystem (10 GiB), and the 6.7 TiB `downloads` subvolume (`csi-vol-8e6a6915-…`, jdownloader/yt-dlp) is on the `replicated` filesystem with no claim in `apps/media`.
The library PVs are pre-bound imports with ordinary ceph-csi `volumeHandle`s (not `staticVolume`), `Retain`, and `controllerExpandSecretRef`, so they can still be expanded through their PVCs.

So **every claim is a separate subvolume, and `anime` is on a separate filesystem.** No pair of them can hardlink or rename into each other today, whatever the mounts look like.
No Sonarr or Radarr is deployed in `apps/` yet, so no *arr root-folder paths need migrating.

Who mounts what today:
- Plex (`apps/media/plex-helm-release.yml`) mounts `movies`, `movies4k`, `tv`, `tv4k`, `anime`, `music` at `/mnt/<name>`.
- copyparty (`apps/media/copyparty-deployment.yml`) mounts the same plus `youtube`, read-only, at `/w/<name>`.
- qBittorrent and Deluge mount their downloads claims at `/downloads`.

## 5. Ways to converge

Library sizes: tv 16.9 + movies 14.5 + movies4k 2.7 + tv4k 0.54 ≈ **34.6 TiB** logical, about **52 TiB raw** on EC 2+1.

### A. Per-library `data` inside each existing subvolume (zero library copy)

Make each library subvolume its own `data` root: move its current contents into `media/` and add `torrents/` (and `usenet/` if wanted) beside it.

- **How.** Inside each subvolume, `mkdir media torrents` and `mv` the top-level entries into `media/`.
  This is a rename within one subvolume and one quota realm, so it is instant (section 2).
  Do it with Plex and copyparty scaled down, or in the same rollout as their mount change.
- **Mounts.**
  - Sonarr mounts `tv` at `/data/tv` (root folder `/data/tv/media`); a second Sonarr for 4K mounts `tv4k` at `/data/tv4k`; Radarr mounts `movies` at `/data/movies`, and a 4K Radarr mounts `movies4k`.
  - qBittorrent mounts all four at the same paths, with one category per library whose save path is `/data/<library>/torrents`, so paths agree and no remote path mapping is needed.
  - Plex and copyparty keep their claims and add `subPath: media`, so their in-container paths (`/mnt/tv`, `/w/tv`) are unchanged and Plex needs no library edit or rescan.
- **Cost.** No library data copied. Existing torrents in `qbittorrent-downloads`/`deluge-downloads` cross subvolumes, so they are copied once (≤ 2Ti each) into the right library's `torrents/`, or left to finish and retired.
  Torrent data counts against the library subvolume's quota, so `tv` (16.9 of 20Ti) wants its PVC raised first.
  A download saved into the wrong category's subvolume falls back to copy.
  The layout departs from the guides' single `/data`, but meets the requirement they state: one mount and one filesystem for each importer's download and library paths.
- **anime** has to move off the `replicated` filesystem anyway (`docs/storage.md`, "Pools awaiting removal"). At 13 GiB, copy it into a new `bulk-rwx` subvolume laid out the same way.

### B. Grow one existing subvolume into a single `/data` (copy about half)

Turn the largest subvolume, `tv`, into the guides' single `data` tree, and copy the rest in.

- **How.** Inside `tv`'s subvolume, `mv` everything into `media/tv` (instant).
  Expand the `tv` PVC (for example to 45Ti; `bulk-rwx` has `allowVolumeExpansion: true`).
  Then copy `movies` into `media/movies`, `movies4k` into `media/movies4k`, `tv4k` into `media/tv4k` and `anime` into `media/anime`.
  Each copy crosses subvolumes (and, for anime, filesystems), so it is a real copy: about **17.8 TiB logical, 26.6 TiB raw**.
  Copy one library at a time, verify, then `ceph fs subvolume rm` the source. Deleting the `Retain` PV does not remove the subvolume. This keeps peak extra usage near the largest single source (movies, 14.5 TiB logical, about 22 TiB raw).
- **Mounts.** Add a static PV named for its job (for example `media-data`), cloned from the `tv` PV per Rook's shared-volume procedure, with `rootPath` set to the `tv` subvolume path.
  Sonarr and Radarr mount it at `/data`; qBittorrent mounts it with `subPath: torrents` at `/data/torrents`.
  Plex and copyparty either mount it once with `subPath: media` at `/data/media` (Plex libraries then need repointing), or once per library with `subPath: media/tv` and so on at the old `/mnt/tv` paths (no Plex change).
  Resizes go through the original `tv` PVC, since static PVs cannot be expanded (section 3).
- **Cost.** About 18 TiB of copying. At a sustained 300 MB/s, roughly 1 TiB an hour, that is a day or so; HDD EC writes may be slower. This is an estimate, not a measurement.
  The `tv` claim name and quota no longer describe what is in it.
  It gives the exact layout the guides document, with one Sonarr and one Radarr root under `/data/media`.

### C. A fresh `bulk-rwx` subvolume for `/data` (copy everything once)

The same as B, but onto a new dynamically provisioned `bulk-rwx` PVC named `data`.

- **Cost.** All 34.6 TiB logical (about 52 TiB raw) is copied, roughly twice B's time. Peak extra raw usage is bounded by copying library by library and deleting each source.
- **Gain over B.** A clean claim whose name, quota and ceph-csi lifecycle (expand, snapshot) match its purpose, with no static PV in the path.

### D. Strip the subvolume markers and mount a common parent (metadata only, unsupported)

The MDS check reads `ceph.dir.subvolume`, and the MDS accepts clearing it (`setfattr -n ceph.dir.subvolume -v 0`, handled in `Server.cc` near line 6553).
The kernel check reads quotas, which can be removed with `setfattr -x ceph.quota.max_bytes`.
With both gone from each library subvolume, a static PV at a common parent (or the `uuid` directories renamed under one new plain directory) gives link and rename between them in seconds, with no data copied.

- **Cost.** It leaves mgr/volumes and ceph-csi describing objects that no longer behave as subvolumes.
  The dynamic library PVs resolve their path through the subvolume API at mount time (`volumeoptions.go` sets `RootPath` from subvolume info), so they would have to be replaced by static PVs.
  `ceph fs subvolume ls/info/rm/snapshot`, CSI snapshots and expansion stop being meaningful for them, and existing subvolume snapshots (not checked) may complicate clearing the flag.
- **Assessment.** Nothing in the Ceph or ceph-csi docs covers this. Only consider it if B's copy is truly unaffordable, and rehearse it on a throwaway subvolume first.

### Comparison

| | Library data copied | Downtime for Plex/copyparty | Matches guides' single `/data` | Stays inside supported Ceph/CSI behaviour |
| --- | --- | --- | --- | --- |
| A. per-library `data` | none (anime 13 GiB; old torrents ≤ 4Ti) | one restart (`subPath` change) | no, one `data` per library | yes |
| B. grow `tv` into `/data` | ~17.8 TiB | one restart per library cutover | yes | yes (one static PV) |
| C. fresh `data` subvolume | ~34.6 TiB | one restart per library cutover | yes | yes |
| D. strip subvolume markers | none | a restart, PV replacement | yes | no |

**Recommendation.** If the per-library shape is acceptable, A gets hardlinks and atomic moves with no bulk copy and no unsupported surgery.
If the single TRaSH-style `/data` matters, for example for cross-library cross-seeding or one Radarr root holding both 1080p and 4K, then B is the cheapest supported path to it.
Either way, give new download claims `bulk-rwx` rather than `ec-cephfs`, which deletes the subvolume with the claim.

## 6. How Plex and copyparty keep working

- Neither needs write access or hardlinks; they need only the library tree.
  `subPath` on their existing `volumeMounts` (A, or B/C mounted per library) keeps every in-container path unchanged, so Plex's library sections and copyparty's `/w/<name>` volumes need no change. The Servarr guide's own pattern also gives the media server only `data/media`.
- A torrent's hardlinked copy in `torrents/` is invisible to them as long as they mount `media` (or below), never the subvolume root.
- copyparty keeps `readOnly: true`. Its index (`hist: /cfg/hists`) is keyed by path, so unchanged paths mean no rescan beyond the usual.
- For B and C, cut over one library at a time: copy, verify, switch that library's Plex/copyparty mount to the new claim with a `subPath`, then retire the old subvolume.
  Plex sees the same mount path backed by different storage. Whether it treats the files as unchanged rather than re-analysing them was not verified.

## Open items not settled by the sources

- The actual size and contents of `qbittorrent-downloads` and `deluge-downloads`, and whether either holds torrents still seeding.
- Whether any library subvolume has CSI snapshots (relevant to D, and to space reclaimed when a source subvolume is removed).
- Free raw capacity on `erasure-coded-data` (`ceph df`), which bounds B and C's peak.
- How CephFS quota accounting (`rbytes`) counts a hardlinked file reached through two directories of the same subvolume; not covered by `quota.rst`.
