#!/bin/bash

# Attempt to manually create the replication user since the bitnami
# scripts don't seem to want to when a custom pg_hba.conf is supplied

# shellcheck disable=SC1091
. /opt/bitnami/scripts/libpostgresql.sh
postgresql_create_replication_user
