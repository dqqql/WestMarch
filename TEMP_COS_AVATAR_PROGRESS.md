# COS Avatar Migration Progress

## Goal

- Keep the user-facing avatar workflow unchanged.
- Replace base64 avatar storage with Tencent Cloud COS object URLs.
- Ensure chat history can display character avatars without bloating message payloads.

## Scope

- Add server-side COS upload support.
- Update resource upload flow to send files instead of base64 JSON.
- Return avatar URLs for chat messages.
- Add a migration script for existing base64 avatar data.
- Keep this document updated as work progresses.

## Progress

- [done] Review current resource upload, avatar display, and chat message flow.
- [done] Add COS SDK and environment variable support.
- [done] Add `/api/resources/upload` route for multipart avatar uploads.
- [done] Update frontend resource upload flow to use file upload with local preview.
- [done] Return `character.img` in chat message history queries.
- [done] Add migration script for existing base64 avatar data.
- [done] Run a production build to confirm the project still compiles.
- [pending] Fill COS environment variables in local and server environments.
- [pending] Run the avatar migration script against the target database.
- [pending] Perform manual local upload and chat verification with real COS credentials.

## Notes

- COS will use the public domain provided by the user: `https://west.bg3ol.top:8443`.
- Bucket access is expected to be public-read for avatar display.
- `COS_PUBLIC_BASE_URL` must resolve to the actual public file host for uploaded objects. If the current domain proxies object files, keep using it; otherwise use the bucket/CDN public domain instead.
