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

> [!NOTE]
> Most of the build process is automated in `start.sh`, however it's still recommended to manually build the application as you'll probably only do it once.

You're going to need a directory to store config and the binary in. The instructions are going to use `out` as an example.

```bash
# Clone the repo
git clone https://github.com/Revolt-Unofficial-Clients/revkit.git
# Move into directory
cd revkit
# Create out directory
mkdir out
```

### Config

Copy `config.example.yaml`
