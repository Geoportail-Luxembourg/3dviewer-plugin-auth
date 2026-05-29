# @geoportallux/lux-3dviewer-plugin-auth

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

This plugin provides authentication for the [Geoportail Luxembourg](https://map.geoportail.lu/) 3D viewer. It adds a login/logout button to the navbar, detects existing sessions on startup, and triggers a theme reload in the `lux-3dviewer-themesync` plugin after login or logout so that private/role-based layers appear or disappear accordingly.

## Development

To further develop the plugin run: `npm start`

## Config parameters

- `baseUrl` - Base URL of the Geoportail authentication backend (e.g. `https://map.geoportail.lu`)
- `credentials` - RequestCredentials property for auth requests: `omit`, `same-origin` or `include` (required for cross-origin setups)

## Deploy plugin within map-ui

- Add plugin dependency in desired version to `plugins/package.json`:

```
"dependencies": {
  ...
  "@geoportallux/lux-3dviewer-plugin-auth": "...",
  ...
```

- Add plugin with desired values to map-ui module configuration. The auth plugin should be listed **before** `lux-3dviewer-themesync` so it initialises first:

```json
{
  "name": "@geoportallux/lux-3dviewer-plugin-auth",
  "entry": "plugins/@geoportallux/lux-3dviewer-plugin-auth/index.js",
  "baseUrl": "https://map.geoportail.lu",
  "credentials": "same-origin"
}
```

## Build the npm package

Use the following commands to increase the version and push a new tag, which builds a new version as npm package:

```shell
npm version 1.0.0 --no-git-tag-version
git add .
git commit -m "1.0.0"
git tag v1.0.0
git push origin main v1.0.0 # replace "origin" with your remote repo name
```
