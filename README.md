![YTMusic](https://github.com/itzTheMeow/YTMusic/blob/main/ytm-header.png?raw=true)

<br />

[![Repo Stars](https://img.shields.io/github/stars/itzTheMeow/YTMusic?style=flat-square&label=Stars&color=661ae6)](https://github.com/itzTheMeow/YTMusic)

A music downloader dashboard.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) is required for the client. The instructions use v20.11.1 but any future versions should work fine.
- [Go](https://go.dev/dl/) is required for the server. v1.22 is assumed but future versions should still work.
- Install pnpm
  ```bash
  npm install -g pnpm
  ```

### Setup

> [!NOTE]
> Most of the build process is automated in `start.sh`, however it's still recommended to manually build the application as you'll probably only do it once.

You're going to need a directory to store config and the binary in. The instructions are going to use `out` as an example.

```bash
# Clone the repo
git clone https://github.com/itzTheMeow/YTMusic.git ytmusic
# Move into cloned repo
cd ytmusic
# Create out directory
mkdir out
```

### Config

Copy `config.example.yaml` to your `out` directory and name it `config.yaml`.

Spotify is **recommended** for the best experience. It is not required to provide a spotify token for YTMusic to work, however you will be limited to soundcloud for metadata. If you don't want spotify then skip this section.

Go to the [spotify developer dashboard](https://developer.spotify.com/dashboard). Log in or create an account, you may need to accept the terms.

Click _Create app_ and enter details about your instance.

- **App Name**

  Enter whatever you want here as a name.

- **App Description**

  Also put whatever you want here.

- **Redirect URIs**

  This is a required field so you can just put `https://example.com` here as its not used in YTMusic.

- **Leave all of the other fields blank, they are not required.**
- Do not choose any APIs/SDKs either.

Save your new app and then click _Settings_ in the top right.

Copy the _Client ID_, this is your `spotify-id`. Click to view the _Client Secret_, copy that to `spotify-secret`.

Paste the values in the config. You can now pretty much never touch spotify again.

It's recommended to keep your `library-folder` set to `./Music` while you're testing but you can change it later in the web ui.

You can change the `piped-api` instance if the default one is giving you trouble. You can get a list of instances [here](https://github.com/TeamPiped/Piped/wiki/Instances). Just use them at your own risk.

### Building the Client

```bash
# Install Dependencies
pnpm install
# Build the Client
pnpm start
```

After the client has finished building, there should be a `dist` directory. Move that into the `server` directory. _(`mv dist server` on linux)_
