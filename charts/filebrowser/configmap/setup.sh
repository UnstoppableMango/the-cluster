#!/bin/bash
set -eum

[ -z "${DB_PATH+x}" ] && echo "DB_PATH not set" && exit 1;
# [ -z "${PUID+x}" ] && echo "PUID not set" && exit 1;
# [ -z "${PGID+x}" ] && echo "PGID not set" && exit 1;
# [ ! -f "$DB_PATH" ] && filebrowser config init -d "$DB_PATH"
# chown -R "$PUID:$PGID" "$(dirname "$DB_PATH")"

if [ ! -f "$DB_PATH" ]; then
    echo "Initializing filebrowser db at $DB_PATH"
    filebrowser config init -d "$DB_PATH"
    echo "Initialized db"
else
    echo "DB already exists at $DB_PATH"
    ls "$(dirname "$DB_PATH")"
fi
