# A public indexer set for Prowlarr behind a VPN exit

Research for [the-cluster#4875](https://github.com/UnstoppableMango/the-cluster/issues/4875). The question: which public indexers in Prowlarr reliably cover movies, TV (including 4K) and anime, and what each one needs to work when traffic leaves through a PIA WireGuard exit outside the US with port forwarding.

Researched 2026-11-05. Every source is pinned to the commit that was read (see [Sources](#sources)). Claims marked **(inferred)** come from reading code or data and were not observed. No site was probed live: this sandbox's egress proxy refuses every candidate host, including `archive.org`. Cloudflare status therefore comes from the definitions and the issue trackers, not from a test.

## TL;DR

1. **Definitions come from Jackett.** Prowlarr's Cardigann YAML definitions are synced daily from Jackett, except for a Prowlarr blocklist. Prowlarr's bug template turns away Cardigann indexer issues. So a YAML indexer's breakage history lives in **Jackett's** history and issue tracker. Prowlarr's own tracker covers only its native C# indexers and the FlareSolverr proxy.
2. **Recommended core set, with no FlareSolverr needed:**
   - General movies and TV: **The Pirate Bay** (it queries the `apibay.org` JSON API), **Knaben** (native, a meta-search API), **TorrentDownloads**, **LimeTorrents** (needs category 8000), **Torrents.csv** (native, needs category 8000).
   - TV only: **EZTV**. Its definition now carries a FlareSolverr notice, so treat it as conditional.
   - Anime: **Nyaa.si**, **SubsPlease** (native), **Anime Tosho** (public again since 2026-09-29), **nekoBT** (Torznab with tvdbid, optional API key), **Tokyo Toshokan**.
3. **The best-stocked general sites sit behind Cloudflare:** 1337x, Uindex, kickasstorrents.to, ExtraTorrent.st and kickasstorrents.ws carry `info_flaresolverr`. They work only through FlareSolverr or Byparr, and since mid-2026 both are unreliable for these sites (FlareSolverr#1737, Prowlarr#2810). Add them as an optional second tier with the lowest priority.
4. **Avoid these:**
   - Prowlarr blocklisted **TheRARBG** (2025-10-05, "significant downstream (Sonarr/Radarr) Support Issues") and **TorrentGalaxyClone** (2026-06-20).
   - Jackett removed **BitSearch** (2026-04-02, after one revert), **iDope**, **Torlock**, **YourBittorrent** and **TorrentGalaxy**.
   - **Magnet Cat** needed 58 domain commits in 12 months.
   - **AniSource** accepts only IPv6, and this cluster's PIA path is IPv4-only.
   - **YTS** is technically healthy, but TRaSH's LQ custom format (score −10000) lists YTS and YIFY. With TRaSH profiles, nothing it returns is grabbed.
5. **Behind the VPN, both IP and protocol must match.** FlareSolverr or Byparr must egress from the **same IP and the same IP family** as Prowlarr, because Prowlarr re-sends the request itself with the solver's cookies and User-Agent.
   - The PIA config here sets `DISABLE_IPV6=yes`. That removes the IPv6 mismatch behind most current "cookies not valid" reports.
   - Prowlarr forwards its **global** proxy to FlareSolverr in each request. Byparr ignores that field, and needs `PROXY_SERVER` or a shared network namespace instead.
6. **Settings that matter:**
   - Leave application tags empty, and every indexer syncs wherever its categories fit.
   - Tags on an indexer select its proxies. They do not stop it syncing to an untagged app.
   - Set priority 1–50 (default 25); it syncs to the apps as a tiebreaker.
   - Use a Sync Profile with a high **Minimum Seeders** for public trackers (TRaSH suggests 20–70).
   - Query and Grab limits per indexer are optional.

## How Prowlarr gets its public indexers

- Prowlarr ships 80 `type: public` Cardigann definitions in `definitions/v11/`, which is the current schema (`VERSIONS`: `CURRENT_VERSION=11`, `MIN_VERSION=11`).
- It also ships native C# public indexers: Anidex, Animedia, Knaben, Shizaproject, SubsPlease and Torrents.csv, plus BinSearch and NzbIndex for usenet, and a Torznab preset for AnimeTosho.
- **The sync from Jackett** is described in the Prowlarr/Indexers `README.md`: "Prowlarr Cardigann Indexers are synced upstream with Jackett via the indexer-sync script … Syncs are automated daily via GitHub Actions … Problematic indexers are automatically excluded using a configurable blocklist."
  - Nearly every commit in the repo is titled `jackett indexers as of <sha>`.
  - `scripts/blocklist.txt` currently lists `torrentgalaxy.yml`, `therarbg.yml`, `torrentgalaxyclone.yml`, `rutracker-ru.yml` and `magnetz.yml` among public sites, plus the YGG and Union family.
  - TheRARBG was removed in commit `3ea0f2da` (2025-10-05) with the message "remove: TheRARBG due to significant downstream (Sonarr/Radarr) Support Issues". TorrentGalaxyClone was removed in `d9542212` (2026-06-20). Both still exist in Jackett.
- **Where breakage gets reported.** Prowlarr's bug template (`.github/ISSUE_TEMPLATE/bug_report.yml`) requires "I confirm this is not related to a Cardigann YML Indexer", and says these "are synced to Prowlarr/Indexers from Jackett/Jackett". Definition fixes land in Jackett first, tagged `resolves #NNNN` against Jackett issues.
- **Changes that reach the apps.** Prowlarr's application sync pushes indexers to Sonarr and Radarr. With Full Sync, a later definition change reaches the apps without manual edits (Servarr Wiki `prowlarr/faq.md`, "What \*Arr Indexer Settings are Compared for App Full Sync").

## Candidates by category

**How to read the table.**

- "Jackett commits (12 mo)" counts commits to `src/Jackett.Common/Definitions/<id>.yml` from 2025-11-05 to 2026-11-05. "Domain" counts how many of those are about domains, TLDs, proxies or mirrors.
- A high total of category or selector fixes means active maintenance. A high domain count means the site keeps moving.
- "CF" means the definition carries `info_flaresolverr`. Prowlarr renders that as "This site may use Cloudflare DDoS Protection, therefore Prowlarr requires FlareSolverr to access it" (`Prowlarr.Api.V1/Indexers/IndexerResource.cs`).
- Search modes come from `caps.modes`. Apart from YTS (`imdbid`) and nekoBT (`tvdbid`), every candidate searches by text only. Sonarr and Radarr therefore search them by title and season/episode, not by ID.

### Movies and TV (general)

Ranked by reliability. Tier A needs no solver.

| Rank | Indexer (id) | Type | CF | Jackett commits (12 mo) | Movie / TV categories | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | The Pirate Bay (`thepiratebay`) | Cardigann | No | 6 (2 proxy drops) | Movies incl. UHD, TV incl. TV/UHD | Queries `https://apibay.org/q.php` (setting `apiurl`). Keyword-less test uses `top100_recent`. 17 links / 42 legacy links. Prowlarr#2827 reports `apibay.org` hitting the FlareSolverr "Empty cookies" path on one setup, and Prowlarr#2810 still saw TPB failing after an IPv6 fix. |
| A2 | Knaben (`Knaben`) | Native C# | No | n/a: 2 Prowlarr commits since 2025-05, both refactors | Full Movies/TV tree | Meta-search through `https://api.knaben.org/v1`, 100 results per call. A JSON API, so no HTML scraping. |
| A3 | TorrentDownloads (`torrentdownloads`) | Cardigann | No | 5 | Movies, TV, TV/Anime | `.torrent` links "known to fail from time to time", with an `itorrents`/magnet fallback setting. Latest fix 2026-11-04 (disabled multi-category filtering). |
| A4 | LimeTorrents (`limetorrents`) | Cardigann | No | 4 | Movies, TV, TV/Anime | Keyword-less results return only **Other**, so apps need 8000 in Sync Categories (`info_category_8000`). Same download-fallback setting as A3. TLD changed 2025-09. |
| A5 | Torrents.csv (`TorrentsCSV`) | Native C# | No | n/a: 1 refactor | Maps only `Other` (8000) | Needs 8000 in Sync Categories, or it never syncs. |
| A6 | TorrentDownload (`torrentdownload`) | Cardigann | No | 3 | Movies, TV, TV/Anime/Doc/Other | Last change 2026-08-09. |
| A7 | EZTV (`eztv`) | Cardigann | **Yes, since 2026-06-28** | 1 | TV only | `info_flaresolverr` was added in Jackett `27798a88a`. Search only by `q, season, ep`; bare `Sxx` season terms are stripped because the site cannot search them. TV only, so it never syncs to Radarr. |
| A8 | TorrentProject2 (`torrentproject2`) | Cardigann | No | 2 (both domain drops) | `Other` only | Needs 8000. A meta-search engine. |
| B1 | 1337x (`1337x`) | Cardigann | **Yes** | 5 | Movies incl. UHD, TV HD/SD, Anime | `requestDelay: 3` (raised 2026-04-03). iTorrents `.torrent` links "known to fail", so the magnet fallback is suggested. Named in FlareSolverr#1737 and Prowlarr#2810. |
| B2 | kickasstorrents.to (`kickasstorrents-to`) | Cardigann | **Yes** | 16 (mostly new categories) | Movies incl. UHD, TV, Anime | 2026-09-24 (Jackett #17089) added `Accept: */*` "to fix 403 error when using flaresolverr/byparr". |
| B3 | ExtraTorrent.st (`extratorrent-st`) | Cardigann | **Yes** | 13 | Widest map: Movies UHD/BluRay, TV UHD | Same header fix (Jackett #17088). Magnets only. |
| B4 | Uindex (`uindex`) | Cardigann | **Yes** | 2 | Movies, TV, Anime | Added 2025-03. Named in Prowlarr#2810. |
| C | kickasstorrents.ws, Magnet Cat, TorrentKitty | Cardigann | ws, Kitty: Yes | Magnet Cat 65 (58 domain) | — | Magnet Cat rotates domains every few days (new alt domains on 2026-10-16, -19, -22, -23, -26, -28, -31, 2026-11-03). TorrentKitty needs 8000. |
| — | YTS (`yts`) | Cardigann | No | 6 (5 domain/proxy) | Movies HD/UHD/3D | Healthy, but see [Naming](#release-naming-and-parsing). `requestDelay: 2.5` ("2 causes problems"). The only general candidate with `imdbid` search. |
| ✗ | TheRARBG, TorrentGalaxyClone | — | — | — | — | Blocklisted in Prowlarr; not available. |
| ✗ | BitSearch, iDope, Torlock, YourBittorrent, TorrentGalaxy, EXT Torrents, Isohunt2 | — | — | — | — | Removed from Jackett, and so from Prowlarr: BitSearch 2026-02-26, briefly reverted, again 2026-04-02 (Jackett #12232); iDope 2026-01-09; Torlock and YourBittorrent 2025-09-10; TorrentGalaxy 2025-04-04. |

**4K.** Only 1337x, TPB, kickasstorrents.to, ExtraTorrent.st and YTS map a `Movies/UHD` category, and only TPB and ExtraTorrent.st map `TV/UHD`.

- Sonarr and Radarr choose quality from the release title, not the indexer category. Sonarr's default Sync Categories include 5000 (TV) and 5045 (TV/UHD), and Radarr's include 2000 and 2045. So indexers that map only coarse `Movies`/`TV` still feed the 4K instances **(inferred from `SonarrSettings.cs`/`RadarrSettings.cs` defaults)**.
- In practice, public 4K coverage depends on TPB plus the Cloudflare-fronted tier B **(inferred)**.

### Anime

| Rank | Indexer | Type | CF | Activity | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Nyaa.si (`nyaasi`) | Cardigann | No | 6 Jackett commits: v2 releases, live-action Sonarr compatibility, season-title search (2026-08-13), alt domains (2026-08-21) | TRaSH: "The vast majority of releases can be found on Nyaa" (Sonarr and Radarr anime profile guides). Settings: `sonarr_compatibility` (adds season info to titles), `strip_s01`, `radarr_compatibility`, `prefer_magnet_links`. `requestDelay: 2`. |
| 2 | SubsPlease (`SubsPlease`) | Native C# | No | Untouched since 2025-06 | Categories TV/Anime and Movies/Other. Two unblock-proxy mirrors are listed as alternative URLs. One release group only. |
| 3 | Anime Tosho (`animetosho-xyz`) | Cardigann (Torznab under the hood) | No | Moved to a new site 2026-05-20; API host gained the `feed.` prefix 2026-07-31; **public again 2026-09-29** (Jackett `122a29853`, previously semi-private) | Queries `https://feed.animetosho.net/api/torznab`. Every result is returned as both 5070 and 2020. Prowlarr's separate Torznab preset "AnimeTosho" still points at `https://feed.animetosho.org` (`Torznab.cs`). The Cardigann one tracks the current host. |
| 4 | nekoBT (`nekobt`) | Cardigann (Torznab) | No | 9 commits, latest 2026-04-21 | `tv-search: [q, season, ep, tvdbid]`. The API key is optional. `incltags` adds metadata tags to titles for custom formats. A subtitle-level filter is available. |
| 5 | Tokyo Toshokan (`tokyotosho`) | Cardigann | No | 2 | Broad Japanese media, including XXX categories; restrict categories. |
| 6 | Anidex (`Anidex`) | Native C# | No | Last functional change 2024-04-21 | Categories Sub/Raw/Dub and LA. |
| — | Bangumi Moe, dmhy (CF), Mikan, ACG.RIP | Cardigann | dmhy: Yes | Chinese-language sources | Mostly Chinese-subtitled. dmhy and ACG.RIP have had no commits since 2025-08. |
| ✗ | AniSource | Cardigann | No | — | "This site only accepts IPv6 addresses." The PIA config here sets `DISABLE_IPV6=yes`, so this site is unreachable. |
| — | Shana Project | Cardigann | No | No commits since 2025-08 | Dormant definition. |

Sonarr routes anime through `AnimeSyncCategories` (default `5070`), separately from `SyncCategories` (`SonarrSettings.cs`). An anime-only indexer reaches Sonarr only because 5070 is in that list. It reaches Radarr only through its Movies mapping: Nyaa and nekoBT map Movies/Other, and Anime Tosho maps 2020.

## Cloudflare, VPN exits, and FlareSolverr vs Byparr

### What Prowlarr actually does

- **When the solver runs.** Proxies are picked per indexer by tag intersection: at most one HTTP/SOCKS proxy plus at most one FlareSolverr proxy (`Indexers/IndexerHttpClient.cs` `GetProxies`).
  - FlareSolverr runs only if the tags match **and** `CloudFlareDetectionService.IsCloudflareProtected` fires.
  - That check needs a 403 or 503 with `Server: cloudflare`, `cloudflare-nginx` or `ddos-guard`, and a body of "Just a moment...", "Access denied", "Attention Required! | Cloudflare", `error code: 1020`, or DDOS-GUARD.
  - A 1020 is a firewall-rule block, not a challenge. A browser solver does not change the rule that blocked it **(inferred)**.
- **How the solution is used.** On detection, Prowlarr calls the solver's `/v1` with `request.get` (or `request.post`) and `maxTimeout = RequestTimeout × 1000` (default 60 s). It then **re-sends the original request itself** with the returned cookies and User-Agent, and caches the UA per host in memory (`IndexerProxies/FlareSolverr/FlareSolverr.cs`).
  - If the solution has no cookies, Prowlarr throws "Empty cookies". Prowlarr#2827, re-opened in 2026, shows this keeps UA-blocked sites like MegaPeer, and TPB's `apibay.org` on that setup, failing forever. A commenter replied there are "no plans to use Flaresolverr to avoid UA blocks like this."
- **The same-IP rule.** Servarr Wiki `prowlarr/faq.md`: "For FlareSolverr to return valid cookies to Prowlarr, the same IP address must be used by both. This includes use of a proxy or VPN, and the internet protocol (IPv6 may need to be disabled)." It also says: "A FlareSolverr proxy is disabled if no tags are used."
- **The global proxy is forwarded.** If Prowlarr's **global** proxy (Settings → General) is enabled, Prowlarr passes it to FlareSolverr in the request body's `proxy` field (`FlareSolverr.cs` → `HttpProxySettingsProvider.GetProxySettings()`). The solver's browser then leaves through the same proxy as Prowlarr's own retry. A per-indexer HTTP proxy chosen by tag is **not** forwarded.

### What this means for a PIA exit

- **IPv6.** The cluster's PIA path is IPv4-only (`DISABLE_IPV6=yes` in `apps/media/qbittorrent-statefulset.yml`).
  - The dominant current failure, "The cookies provided by FlareSolverr are not valid", is attributed in FlareSolverr#1737 and Prowlarr#2810 to an IPv4/IPv6 split between the app and the solver. The same thread says "not a VPN issue: failures happen with and without a VPN."
  - If Prowlarr and the solver share the tunnel, this cause goes away **(inferred)**.
  - Prowlarr#2810 lists 1337x, Uindex, kickasstorrents.ws, Magnet Cat and EZTV as working once IPv6 was disabled. TPB still failed.
- **Same IP.** The solver and Prowlarr must leave through the same exit. Either of these works:
  - put both in one pod behind one gluetun sidecar (one netns);
  - point Prowlarr's global proxy at a gluetun HTTP proxy. FlareSolverr then inherits it per request. Byparr does not (see below), so it needs `PROXY_SERVER` set to the same proxy.
  - Two separate gluetun sidecars on PIA do not guarantee the same exit IP **(inferred)**.
- **Exit reputation.** Cloudflare decides when to challenge. Its docs say only that clearance "is securely tied to the specific visitor and device it was issued to, preventing reuse across machines", and lasts for the zone's Challenge Passage period (developers.cloudflare.com, "Clearance").
  - Byparr's README warns that Cloudflare "likely require[s] valid network traffic originating from the user's public IP address".
  - None of the definitions or tracker threads read here say a specific public indexer blocks VPN ranges outright. Expect more challenges on shared VPN exits than on a residential IP, not a hard block **(inferred)**.
- **Torrent downloads.** TPB, ExtraTorrent and several others return magnets only. 1337x, LimeTorrents and TorrentDownloads fetch `.torrent` files from `itorrents.net` and fall back to magnets. qBittorrent then resolves metadata over DHT through its own tunnel and needs nothing from Prowlarr's egress.

### FlareSolverr (as of 2026-11-05)

- Latest release **v3.5.2 (2026-09-12)**. Commits continued to 2026-10-24. The maintainer is ilike2burnthing, who also maintains the Jackett definitions. v3.5.0 (2026-05-26) added Turnstile solving.
- Engine: Selenium with undetected-chromedriver. "With each request a new browser is launched", so memory scales with concurrent requests.
- README: "At this time none of the captcha solvers work." Interactive CAPTCHAs (as opposed to JS and Turnstile challenges) are not solved.
- Open problem: FlareSolverr#1737, "(testing) Exception: The cookies provided by FlareSolverr are not valid". Reports cluster in late June 2026, name 1337x, EZTV, RuTracker and Torrent[CORE], and several say it began with 3.5.0 after 3.4.6 worked. No maintainer-confirmed fix.
- TRaSH's page still says "FlareSolverr is currently non-functional". That banner dates from 2024-10-26 (Guides `b877ba91`) and was not updated through the 3.4.x and 3.5.x releases, so it is stale rather than current evidence.

### Byparr (as of 2026-11-05)

- Latest release **v3.0.4 (2026-08-18)**. Commits continue daily (latest 2026-11-05) by ThePhaseless and Renovate. It serves a FlareSolverr-compatible `POST /v1` on port 8191, so Prowlarr's FlareSolverr proxy type points at it unchanged.
- Engine: Playwright (`invisible-playwright`, `playwright-captcha`, a Camoufox path). It derives the browser timezone and locale from the egress IP's GeoIP.
  - Behind a non-US VPN, that makes the browser's timezone and locale match the exit country. Set `BROWSER_TIMEZONE` and `BROWSER_LOCALE` to pin them.
  - At startup it downloads the GeoIP database from GitHub and looks up its public IP through `api.ipify.org`, `icanhazip.com` or `checkip.amazonaws.com`, so the port stays closed until that finishes.
- Compatibility gaps found in the code (`src/models.py`, `src/endpoints.py`):
  - `cmd` is "purely for compatibility … currently only supports GET". There is no `postData` field, so `request.post` from Prowlarr arrives as a plain GET navigation.
  - There is no `proxy` field, so Prowlarr's forwarded global proxy is dropped. Byparr proxies only through `PROXY_SERVER` or the `X-Proxy-Server` header.
- README: "This software does not **guarantee** … that any challenge will be bypassed." It recommends `shm_size: 1gb` and tmpfs for `/tmp` because of heavy disk I/O. ARM support is minimal.
- Jackett definition fixes now name both solvers, for example #17088 and #17089 (2026-09-24), "fix 403 error when using flaresolverr/byparr". Both solvers are in active use against these sites.

**Bottom line on solvers:** both are maintained as of November 2026. Neither is reliable against the tier B sites today. FlareSolverr fits Prowlarr's request model better: it handles POST and accepts the forwarded proxy. Byparr has the more active codebase and a geo-consistent browser.

## Release naming and parsing

- **TRaSH LQ groups.** TRaSH's LQ custom format scores −10000 by default (`docs/json/radarr/cf/lq.json`) and lists, among others:
  - **YTS** ("Microsized encodes. Quality.") and **YIFY** ("Microsized, poorly cropped re-encodes");
  - **RARBG**, **MeGusta**, **PSA**, **Pahe**, **Tigole**, and **GalaxyRG** ("Some releases are badly formatted").
  
  These are the house groups of the biggest public sites. With TRaSH profiles, YTS contributes nothing, and much of what TPB and 1337x return for TV will score LQ (`docs/banned-rlsgrps-public.md`).
- **Nyaa.** Fansub titles often lack `SxxEyy`. The definition's `sonarr_compatibility` and `strip_s01` options exist to bridge that, and Jackett has kept tuning them through 2026: v2 releases, live-action titles, and season-title search.
- **Anime Tosho.** It carries `sonarr_compatibility`, `strip_s01` and `radarr_compatibility` too. **nekoBT** can append metadata tags (`incltags`) "to be used with Sonarr and Radarr custom formats".
- **Seeder counts.** TRaSH's limited-API guide says to set Minimum Seeders "somewhere between 20-70" for public trackers, "being they often lie about their seeders amount".

## Prowlarr settings that matter

- **Application tags.** "Sync Indexers to this application that have one or more matching tags. If no tags are listed here, then no indexers will be prevented from syncing due to their tags." (`en.json` `ApplicationTagsHelpText`)
  - The code agrees: `ApplicationService.ShouldHandleIndexer` returns true when the app has no tags, and otherwise requires a tag intersection.
  - The UI warning "An indexer with a tag will only sync to apps with the same tag" overstates it. Tagging an indexer `flaresolverr` does **not** stop it syncing to untagged apps.
  - **Pattern for four app instances:** leave Sonarr and Radarr untagged so they get everything. Tag Sonarr 4K and Radarr 4K (for example `uhd`) and tag only the indexers that carry 4K (TPB, the tier B sites). Indexers without `uhd` then stop reaching the 4K apps.
- **Categories.** Indexers sync only if they support at least one of the app's Sync Categories (`Sonarr.cs`).
  - Defaults: Sonarr `5000,5010,5020,5030,5040,5045,5050,5090` plus anime `5070`; Radarr `2000…2090`.
  - Add **8000** to each app's Sync Categories for LimeTorrents, Torrents.csv, TorrentProject2 and TorrentKitty. Otherwise the apps' test fails with "Query successful, but no results in the configured categories were returned" (Servarr FAQ).
- **Sync Profiles.** Each profile sets Enable RSS, Enable Automatic Search, Enable Interactive Search and Minimum Seeders. Per indexer, "Apps Minimum Seeders" overrides the profile. Prowlarr syncs these values and the indexer priority into each app's indexer (`Sonarr.cs`).
  - Every app polls RSS on its own interval of 10–120 minutes (Sonarr and Radarr settings). Four apps with RSS on means four times the keyword-less requests to each site **(inferred)**.
  - For Cloudflare-fronted tier B, a profile with RSS off and only Automatic and Interactive Search on limits solver load. TRaSH's limited-API guide describes this pattern with two extra profiles.
- **Priority.** "Indexer Priority from 1 (Highest) to 50 (Lowest). Default: 25." It syncs to the apps, where it is a release tiebreaker (Sonarr and Radarr settings). Put tier A ahead of tier B.
- **Query and Grab Limit.** These are advanced per-indexer settings, per Day (default) or Hour (`IndexerBaseSettings.cs`). Public sites publish no quotas. Definitions already throttle with `requestDelay` (1337x 3 s, YTS 2.5 s, Nyaa and KAT 2 s, AniSource 5 s), so limits are optional. Once the grab limit is reached, "further queries will trigger an unhandled exception in \*Arr Apps".
- **Failure back-off.** A failing indexer is disabled with escalating back-off: 0, 1 min, 5 min, 15 min, 30 min, 1 h, 3 h, 6 h, 12 h, up to 24 h (`EscalationBackOff.cs`). An unreliable solver-backed indexer therefore silently drops out for hours.
- **FlareSolverr proxy entry.** Add the proxy with a tag, then put the same tag on tier B indexers only. The request timeout ranges 1–180 s, default 60 s (TRaSH; `FlareSolverrSettings.cs`).
- **Base URL.** Cardigann indexers offer every `links` entry as a selectable Base URL. When a primary domain is challenged, another mirror may not be (TRaSH's FlareSolverr page).

## Open points

- Whether PIA exits in the chosen region get challenged more by these specific sites can only be measured from inside the tunnel. No primary source covers it.
- The two AnimeTosho hosts (`feed.animetosho.net` in the Cardigann definition, `feed.animetosho.org` in Prowlarr's Torznab preset) were not resolved here.
- Prowlarr `develop` was read at `aa4e451400`. Stable may lag on native-indexer details, but nothing used here changed recently.

## Sources

Repositories (cloned and read at these commits):

- Prowlarr/Indexers `9ecfe4f983` (2026-11-01): `definitions/v11/*.yml`, `VERSIONS`, `README.md`, `scripts/blocklist.txt` and its history, deletion history of `definitions/v11/` since 2024-01-01.
- Jackett/Jackett `fed7a1dfec` (2026-11-05): per-definition `git log` of `src/Jackett.Common/Definitions/*.yml`, `README.md` (public tracker list, FlareSolverr section), commits `27798a88a`, `0a3d3780b`, `e5cad093b`, `122a29853`.
- Prowlarr/Prowlarr `develop` `aa4e451400` (2026-11-04):
  - `IndexerProxies/FlareSolverr/*`, `Http/CloudFlare/CloudFlareDetectionService.cs`, `Http/HttpProxySettingsProvider.cs`, `Indexers/IndexerHttpClient.cs`;
  - `Indexers/IndexerBaseSettings.cs`, `Indexers/IndexerDefinition.cs`, `Applications/ApplicationService.cs`, `Applications/{Sonarr,Radarr}/*`, `ThingiProvider/Status/EscalationBackOff.cs`;
  - `Indexers/Definitions/{Knaben,TorrentsCSV,SubsPlease,Anidex}.cs`, `Indexers/Definitions/Torznab/Torznab.cs`, `Localization/Core/en.json`, `Prowlarr.Api.V1/Indexers/IndexerResource.cs`, `.github/ISSUE_TEMPLATE/bug_report.yml`.
- FlareSolverr/FlareSolverr `cc2224b21e` (2026-10-24): `README.md`, `CHANGELOG.md`, tags.
- ThePhaseless/Byparr `406ad428c4` (2026-11-05): `README.md`, `pyproject.toml`, `src/models.py`, `src/endpoints.py`, `src/utils.py`, tags.
- Servarr/Wiki `477b14f184` (2026-11-02): `prowlarr/faq.md`, `prowlarr/indexers.md`, `prowlarr/settings.md`, `sonarr/settings.md`, `radarr/settings.md`.
- TRaSH-Guides/Guides `d0f1a6cb29` (2026-11-03): `docs/Prowlarr/prowlarr-setup-flaresolverr.md` (history: `b877ba91`), `docs/Prowlarr/prowlarr-setup-limited-api.md`, `docs/banned-rlsgrps-public.md`, `docs/json/radarr/cf/lq.json`, `docs/Sonarr/sonarr-setup-quality-profiles-anime.md`, `docs/Radarr/radarr-setup-quality-profiles-anime.md`.
- UnstoppableMango/the-cluster `origin/main` `b994a963`: `apps/media/qbittorrent-statefulset.yml` (PIA `DISABLE_IPV6`, gluetun).

Issue threads (read on github.com):

- [FlareSolverr#1737](https://github.com/FlareSolverr/FlareSolverr/issues/1737): cookies not valid since 3.5.0, IPv6 theory.
- [FlareSolverr#1253](https://github.com/FlareSolverr/FlareSolverr/issues/1253): the 2024 outage TRaSH's banner links to.
- [Prowlarr#2810](https://github.com/Prowlarr/Prowlarr/issues/2810): "Blocked by CloudFlare Protection" despite FlareSolverr success; IPv6 workaround.
- [Prowlarr#2827](https://github.com/Prowlarr/Prowlarr/issues/2827): Empty-cookies solution treated as fatal; UA-blocked indexers.
- [Jackett#16975](https://github.com/Jackett/Jackett/issues/16975): 1337x via FlareSolverr.

Cloudflare documentation:

- [Clearance](https://developers.cloudflare.com/cloudflare-challenges/concepts/clearance/)
- [Cloudflare Cookies](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/)
