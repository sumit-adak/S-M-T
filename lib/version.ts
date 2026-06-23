// Evaluated once when the Node server boots (i.e. once per deploy/restart),
// so it's a stable per-deploy cache-buster for the static /js files.
export const ASSET_VERSION =
  process.env.ASSET_VERSION || String(Date.now());
