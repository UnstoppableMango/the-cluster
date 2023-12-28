#!/bin/bash
set -eum

[ -z "${DB_PATH+x}" ] && echo "DB_PATH not set" && exit 1;
# [ -z "${PUID+x}" ] && echo "PUID not set" && exit 1;
# [ -z "${PGID+x}" ] && echo "PGID not set" && exit 1;
# chown -R "$PUID:$PGID" "$(dirname "$DB_PATH")"

if [ ! -f "$DB_PATH" ]; then
    echo "Initializing filebrowser db at $DB_PATH"
    filebrowser config init -d "$DB_PATH"
    echo "Initialized db"
else
    echo "DB already exists at $DB_PATH"
    ls "$(dirname "$DB_PATH")"
fi

[ -n "${FILEBROWSER_USER_HEADER+x}" ] && {
    echo "Configuring auth header to be $FILEBROWSER_USER_HEADER"
    filebrowser config set -d "$DB_PATH" --auth.method="proxy" --auth.header "$FILEBROWSER_USER_HEADER"
}

filebrowser config -d "$DB_PATH" cat
