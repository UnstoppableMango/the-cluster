#!/bin/sh
if [ ! -f $2 ]; then
  echo "core.conf not found"
  exit 1
fi
TEMPFILE="temp.conf"
echo "Copying base to temp file"
cp $3 $TEMPFILE
#Remove the newline at the end
#busybox doesn't have trucate
# truncate -s -1 $TEMPFILE
echo "Appending to temp file"
jq -s ".[1] * .[2]" $1 $2 >> $TEMPFILE
echo "Copying temp file over core.conf"
cp $TEMPFILE $1
