<img width="80" height="80" alt="download" src="https://github.com/user-attachments/assets/10fd6ab8-8d6f-4b63-8c88-099eccdc7020" />

# Download Router

A Firefox extension that automatically sorts your downloads into subfolders based on filename matching rules.

## How it works

Firefox has no equivalent to Chrome's `downloads.onDeterminingFilename` API (see [bugzilla.mozilla.org/1245652](https://bugzilla.mozilla.org/show_bug.cgi?id=1245652)), so there's no way to redirect a download's destination before it starts. To work around this, the extension:

1. Lets the download complete normally in your default downloads folder.
2. Checks the filename against your configured routing rules.
3. If it matches, re-downloads the file into the target subfolder.
4. Removes the original copy once the routed copy finishes.

This briefly duplicates the file on disk, but the end result is one file, in the desired folder.

## Known limitations

Because of the mechanism above, a few download types won't be routed. In every case, the original file is left untouched in your default downloads folder — nothing is lost, routing just doesn't apply:

- **Private browsing windows / Multi-Account Containers** — the re-download can't replay a container- or private-session-specific cookie jar.
- **Blob-URL downloads** (in-page "Export as PDF/CSV" style buttons) — there's no network request to re-issue.
- **POST-triggered downloads** — the re-download is always a GET, so it can't replay a POST body.

## Permissions

- `downloads` — to observe, start, and remove downloads.
- `storage` — to store your routing rules (`storage.local`) and track in-flight routed downloads (`storage.session`).
## Contributing

Issues and PRs welcome. See [open limitations](#known-limitations) before filing a bug about a download that didn't get routed — check whether it falls into one of the categories above first.
