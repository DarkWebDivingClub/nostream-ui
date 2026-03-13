# Nostream

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a
development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

#### Test Bench

To test this code we run a LXC container containing a set of strfry relays behind a nginx
The nginx is configured to respond on port 80 and 443, and then port forwards to port 7777 and 7778 depending on the
domain being accessed, relay.lxc = 7777 relay.bf.lxc = 7778

## Relay and Tracker Config

Runtime relay/tracker settings are environment driven:

1. `VITE_APPLICATION_RELAY`
2. `VITE_DEFAULT_COMMUNITY_RELAY`
3. `VITE_TORRENT_ANNOUNCE` (comma-separated tracker URLs)
4. `VITE_SIGNER_RELAYS` (comma-separated signer relay URLs)

Examples:

```bash
# local docker/test network
VITE_APPLICATION_RELAY=ws://strfry:7777/
VITE_DEFAULT_COMMUNITY_RELAY=ws://strfry:7777/
VITE_TORRENT_ANNOUNCE=ws://tracker:8000
VITE_SIGNER_RELAYS=ws://strfry:7777/
```

```bash
# public deployment
VITE_APPLICATION_RELAY=wss://relay.dev.nostream.org
VITE_DEFAULT_COMMUNITY_RELAY=wss://relay.big-fish.communities.dev.nostream.org
VITE_TORRENT_ANNOUNCE=wss://tracker.webtorrent.dev,wss://tracker.btorrent.xyz,wss://tracker.openwebtorrent.com
VITE_SIGNER_RELAYS=wss://relay.dev.nostream.org
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target
> environment.
