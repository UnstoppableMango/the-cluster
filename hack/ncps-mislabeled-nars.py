#!/usr/bin/env python3
"""Find NAR objects in the ncps bucket whose bytes do not match their extension.

ncps v0.10.1 has been seen storing zstd bytes under a `.nar.xz` key while the
narinfo and nar_file rows say xz. nix then fails the substitution with
`input compression not recognized`, on every run, until the object goes.
docs/ncps.md ("Mislabeled NARs") has the background.

The script lists every whole-file nar_file row with compression xz or zstd,
reads the first six bytes of its object, and reports the ones whose magic is
wrong. With --apply it deletes those objects, then their nar_file rows and the
narinfos linked to them, so the next request refetches the path from upstream.
Objects go first: ncps reuses an object that already exists when it stores a
refetched NAR, so a row deleted ahead of its object would come back bad.

Run it from a machine with kubectl access to the cluster:

    nix shell nixpkgs#python3Packages.boto3 -c python3 hack/ncps-mislabeled-nars.py
    nix shell nixpkgs#python3Packages.boto3 -c python3 hack/ncps-mislabeled-nars.py --apply

Back the database up first (docs/ncps.md, "Database backup and restore").
"""

import argparse
import base64
import concurrent.futures
import contextlib
import json
import socket
import subprocess
import sys
import time

import boto3
import botocore.config
import botocore.exceptions
import urllib3

NAMESPACE = "nix-system"
BUCKET = "ncps-cache"
SECRET = "ncps-cache-fast"
RGW_NAMESPACE = "rook-ceph"
RGW_SERVICE = "svc/rook-ceph-rgw-s3-fast"

MAGIC = {
    "xz": bytes.fromhex("fd377a585a00"),
    "zstd": bytes.fromhex("28b52ffd"),
}
EXTENSION = {"xz": "xz", "zstd": "zst"}


def kubectl(*args, stdin=None):
    return subprocess.run(
        ["kubectl", *args], input=stdin, capture_output=True, text=True, check=True
    ).stdout


def psql(primary, sql, stdin=None):
    args = ["-n", NAMESPACE, "exec", "-i", primary, "-c", "postgres", "--"]
    args += ["psql", "ncps", "-v", "ON_ERROR_STOP=1", "-At", "-F", "\t"]
    if stdin is None:
        return kubectl(*args, "-c", sql)
    return kubectl(*args, stdin=stdin)


def object_key(nar_hash, compression):
    name = f"{nar_hash}.nar.{EXTENSION[compression]}"
    return f"store/nar/{name[:1]}/{name[:2]}/{name}"


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@contextlib.contextmanager
def port_forward():
    port = free_port()
    proc = subprocess.Popen(
        ["kubectl", "-n", RGW_NAMESPACE, "port-forward", RGW_SERVICE, f"{port}:443"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        for _ in range(50):
            with contextlib.suppress(OSError), socket.create_connection(("127.0.0.1", port), 0.2):
                break
            time.sleep(0.2)
        else:
            sys.exit("port-forward to the s3-fast RGW never came up")
        yield f"https://127.0.0.1:{port}"
    finally:
        proc.terminate()


def s3_client(endpoint):
    secret = json.loads(kubectl("-n", NAMESPACE, "get", "secret", SECRET, "-o", "json"))["data"]
    # The RGW certificate is issued for the in-cluster service names, not for the
    # loopback address the port-forward listens on.
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        region_name="us-east-1",
        verify=False,
        aws_access_key_id=base64.b64decode(secret["AWS_ACCESS_KEY_ID"]).decode(),
        aws_secret_access_key=base64.b64decode(secret["AWS_SECRET_ACCESS_KEY"]).decode(),
        config=botocore.config.Config(
            s3={"addressing_style": "path"}, max_pool_connections=32, retries={"max_attempts": 5}
        ),
    )


def check(s3, nar_hash, compression):
    key = object_key(nar_hash, compression)
    try:
        head = s3.get_object(Bucket=BUCKET, Key=key, Range="bytes=0-5")["Body"].read()
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] in ("NoSuchKey", "404"):
            return "missing", key, b""
        # An empty object answers a ranged read with InvalidRange; anything that
        # cannot be read is not something to delete blind.
        return "error", key, e.response["Error"]["Code"].encode()
    if head.startswith(MAGIC[compression]):
        return "ok", key, head
    return "bad", key, head


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--apply", action="store_true", help="delete what is found")
    args = parser.parse_args()

    primary = kubectl(
        "-n", NAMESPACE, "get", "cluster", "postgres", "-o", "jsonpath={.status.currentPrimary}"
    ).strip()
    rows = [
        line.split("\t")
        for line in psql(
            primary,
            "SELECT hash, compression FROM nar_files"
            " WHERE compression IN ('xz', 'zstd') AND total_chunks = 0",
        ).splitlines()
        if line
    ]
    print(f"checking {len(rows)} xz and zstd NARs on {primary}", file=sys.stderr)

    counts = {"ok": 0, "bad": 0, "missing": 0, "error": 0}
    bad = []
    with port_forward() as endpoint:
        s3 = s3_client(endpoint)
        with concurrent.futures.ThreadPoolExecutor(32) as pool:
            futures = {pool.submit(check, s3, h, c): (h, c) for h, c in rows}
            for future in concurrent.futures.as_completed(futures):
                nar_hash, compression = futures[future]
                status, key, head = future.result()
                counts[status] += 1
                if status == "bad":
                    bad.append((nar_hash, compression, key))
                    print(f"bad\t{key}\tstarts {head.hex(' ')}")
                elif status != "ok":
                    print(f"{status}\t{key}\t{head.decode()}", file=sys.stderr)

        print(
            f"{counts['ok']} ok, {counts['bad']} mislabeled, {counts['missing']} missing,"
            f" {counts['error']} unreadable",
            file=sys.stderr,
        )
        if not bad or not args.apply:
            if bad:
                print("rerun with --apply to delete them", file=sys.stderr)
            return

        for i in range(0, len(bad), 1000):
            batch = bad[i : i + 1000]
            s3.delete_objects(
                Bucket=BUCKET,
                Delete={"Objects": [{"Key": key} for _, _, key in batch], "Quiet": True},
            )
        print(f"deleted {len(bad)} objects", file=sys.stderr)

    copy = "".join(f"{h}\t{c}\n" for h, c, _ in bad)
    out = psql(
        primary,
        None,
        stdin=f"""BEGIN;
CREATE TEMP TABLE bad (hash text, compression text);
COPY bad FROM STDIN;
{copy}\\.
DELETE FROM narinfos WHERE id IN (
  SELECT l.narinfo_id FROM narinfo_nar_files l
  JOIN nar_files f ON f.id = l.nar_file_id
  JOIN bad b ON b.hash = f.hash AND b.compression = f.compression);
DELETE FROM nar_files f USING bad b WHERE f.hash = b.hash AND f.compression = b.compression;
COMMIT;
""",
    )
    print(out.strip(), file=sys.stderr)


if __name__ == "__main__":
    main()
