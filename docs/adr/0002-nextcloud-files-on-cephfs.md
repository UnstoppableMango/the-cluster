# Nextcloud user files live on CephFS, not S3 primary storage

Nextcloud's data directory is a `standard-rwx` claim rather than primary object storage on `bucket`.
With S3 primary storage Nextcloud stores files as opaque `urn:oid:<fileid>` objects that only its database can map back to paths, so the files are unreadable without Nextcloud and moving off it later means a full export and re-upload.
CephFS keeps the files as a plain tree, `Retain` keeps the subvolume if the claim is deleted, and the shared mount lets cron and preview jobs run beside the app.
