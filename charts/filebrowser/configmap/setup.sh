#!/bin/bash
set -e

[ -z "${DB_PATH+x}" ] && echo "DB_PATH not set" && exit 1;
[ -z "${CONFIG_PATH+x}" ] && echo "CONFIG_PATH not set" && exit 1;
[ -z "${PUID+x}" ] && echo "PUID not set" && exit 1;
[ -z "${PGID+x}" ] && echo "PGID not set" && exit 1;

DB_DIR="$(dirname "$DB_PATH")"
echo "chown -R $PUID:$PGID $DB_DIR"
chown -R "$PUID:$PGID" "$DB_DIR"

echo "chown -R $PUID:$PGID /srv"
chown -R "$PUID:$PGID" /srv

if [ -f "$DB_PATH" ]; then
    echo "DB already exists at $DB_PATH"
    echo "\$> ls $DB_DIR"
    ls "$DB_DIR"
else
    echo "Initializing filebrowser db at $DB_PATH"
    filebrowser config init --config "$CONFIG_PATH" --database "$DB_PATH"
    echo "✅ Successfully initialized db"
fi

echo "
filebrowser config set
    --config $CONFIG_PATH
    --database $DB_PATH
    --auth.method $FILEBROWSER_AUTH_METHOD
    --auth.header $FILEBROWSER_AUTH_HEADER
    --branding.color $FILEBROWSER_BRANDING_THEME
    --branding.name $FILEBROWSER_BRANDING_NAME
    --branding.disableUsedPercentage $FILEBROWSER_DISABLE_USED_PERCENTAGE
    --branding.disableExternal $FILEBROWSER_DISABLE_EXTERNAL
    --branding.files $FILEBROWSER_BRANDING_FILES
    --viewMode $FILEBROWSER_VIEW_MODE
"

args=()
if [ -n "${FILEBROWSER_DISABLE_USED_PERCENTAGE+x}" ]; then
    args+=("--branding.disableUsedPercentage")
fi

if [ -n "${FILEBROWSER_DISABLE_EXTERNAL+x}" ]; then
    args+=("--branding.disableExternal")
fi

if [ -n "${FILEBROWSER_BRANDING_FILES+x}" ]; then
    args+=(--branding.files "$FILEBROWSER_BRANDING_FILES")
fi

# https://filebrowser.org/cli/filebrowser-config-set
filebrowser config set \
    --config "$CONFIG_PATH" \
    --database "$DB_PATH" \
    --auth.method "$FILEBROWSER_AUTH_METHOD" \
    --auth.header "$FILEBROWSER_AUTH_HEADER" \
    --branding.color "$FILEBROWSER_BRANDING_THEME" \
    --branding.name "$FILEBROWSER_BRANDING_NAME" \
    --viewMode "$FILEBROWSER_VIEW_MODE" \
    "${args[@]}"
echo "✅ Successfully applied configuration"
