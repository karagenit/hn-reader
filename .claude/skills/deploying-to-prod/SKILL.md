---
name: deploying-to-prod
description: Deploy hn-reader to the production VPS (hn.caleb.software) — pull, build, and restart the systemd service.
---

# Deploying hn-reader to prod

The app runs on a DigitalOcean droplet (SSH alias `do-vps`, see `~/Documents/vps/README.md` for SSH setup) as a systemd service, reverse-proxied by Apache.

## Topology

- Code lives at `/var/www/hn-reader` on the server, owned by a dedicated `hn-reader` user (not root) — always act as that user via `sudo -u hn-reader`.
- It's a git checkout with `origin` = `https://github.com/karagenit/hn-reader`. **The server currently tracks the `debug` branch**, not `main` — check `sudo -u hn-reader git -C /var/www/hn-reader status` to confirm which branch is actually checked out before pulling, since this may change over time.
- Go toolchain is installed at `/usr/local/go/bin/go` (not on `$PATH` for the `hn-reader` user). The server is `x86_64` — if deploying from an ARM Mac, don't cross-compile locally and copy the binary over; build directly on the server instead, which is what's always been done here.
- The compiled binary (`hn-reader`) sits alongside the source in the same directory and is what systemd execs directly — there's no separate build/release dir.
- Node 22 is installed system-wide (via NodeSource, `apt install nodejs`, on `$PATH` for all users) so the frontend can be built on the server too — `assets/dist/` (the Vite-bundled JS) is gitignored, not committed, so **`npm ci && npm run build` must run before `go build`** on every deploy or the server will serve a stale/missing bundle. The droplet is memory-constrained (~1GB RAM, no swap) but `npm ci`/`vite build` for this project takes ~12s and is lightweight, so this hasn't been an issue.
- Service: `hn-reader.service` (`systemctl cat hn-reader.service` to view). Runs as user `hn-reader`, `Restart=on-failure`. Listens on `localhost:8080`.
- Apache vhost `/etc/apache2/sites-available/hn.caleb.software.conf` reverse-proxies `hn.caleb.software` (port 80) to `localhost:8080`. This rarely needs touching for a normal deploy — only if ports/domain change.
- `/etc/apache2` itself is a separate git repo pushed to `vps-etc`; unrelated to app deploys unless you're changing the vhost.

## Standard deploy

```bash
ssh do-vps "sudo -u hn-reader bash -c '
  cd /var/www/hn-reader &&
  git status &&
  git pull &&
  npm ci &&
  npm run build &&
  /usr/local/go/bin/go build -o hn-reader . &&
  echo BUILD_OK
'"
ssh do-vps "systemctl restart hn-reader.service"
ssh do-vps "systemctl status hn-reader.service --no-pager"
```

Check logs after restart to confirm it came up clean:

```bash
ssh do-vps "journalctl -u hn-reader.service -n 50 --no-pager"
# or the app's own log file:
ssh do-vps "tail -n 50 /var/www/hn-reader/log.txt"
```

## Notes / gotchas

- `git status` on the server will throw "detected dubious ownership" if run as root instead of `sudo -u hn-reader` — always run git commands as `hn-reader`, not root.
- The working tree on the server has untracked files (`hn-reader` binary, rotated `log-*.txt` files) — this is expected, not drift to clean up.
- Restarting the service (rather than killing/backgrounding `go run` manually) is the correct restart path; there's no separate "kill the old process" step — systemd handles it.
- If you change the Apache vhost, reload apache (`apachectl configtest && systemctl reload apache2`) and commit from `/etc/apache2` per the `vps-etc` workflow in `~/Documents/vps/README.md` — that's tracked separately from the app repo.
