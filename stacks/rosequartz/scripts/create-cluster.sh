#!/bin/bash

set -eu

# TODO: Check if cluster is already running
talosctl cluster create --wait
