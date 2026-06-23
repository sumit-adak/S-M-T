cd /var/www/veeshal
git pull origin main
npm ci
npm run build
sudo systemctl restart veeshal-next

# Deploying the Next.js site to the VPS (nginx)

The repo is now a pure Next.js app at its root (the PHP files were removed).
We run Next on an internal port (`127.0.0.1:3002`) and point nginx at it via a
reverse proxy.

> **Port note:** this box already runs other Next apps — `3000`
> (anglo-bodo-dictionary / bodookhrang), `3001` (ku-app), `8000` (supabase).
> veeshal uses **3002** to avoid an `EADDRINUSE` collision. If you change it,
> change it in both the systemd unit (`PORT=`) and the nginx `proxy_pass`.

> **Before you pull on the VPS:** the old PHP is gone from the repo, so the next
> `git pull` will remove the PHP files from the server. Do steps 1–5 in one
> sitting so there's no gap. Note your current commit first for rollback:
> `git -C /var/www/veeshal rev-parse HEAD` and back up the nginx file:
> `sudo cp /etc/nginx/sites-enabled/veeshal ~/veeshal-nginx-php.bak`.

---

## 1. One-time: install Node 22 LTS on the VPS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should print v22.x
```

## 2. One-time: env file on the VPS

`.env.local` is gitignored, so it never lands via `git pull` — create it once:

```bash
cd /var/www/veeshal
nano .env.local        # paste the same vars as your old .env
```

It needs at minimum:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
EMAILJS_SERVICE_ID=...
EMAILJS_TEMPLATE_ID=...
EMAILJS_PUBLIC_KEY=...
```

## 3. Pull + build

```bash
cd /var/www/veeshal
git pull origin main    # removes PHP, brings the Next app to the root
npm ci                  # clean install from package-lock.json
npm run build
```

## 4. One-time: run Next as a systemd service

Create `/etc/systemd/system/veeshal-next.service`:

```ini
[Unit]
Description=veeshal.me Next.js
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/veeshal
# next start serves the production build on 127.0.0.1:3002
ExecStart=/usr/bin/npm run start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3002

[Install]
WantedBy=multi-user.target
```

Enable + start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now veeshal-next
sudo systemctl status veeshal-next      # active (running)
wget -qO- http://127.0.0.1:3002 | head  # Next is responding
```

## 5. Point nginx at Next

Edit `/etc/nginx/sites-enabled/veeshal`. Replace the PHP `location` blocks
with a reverse proxy. Keep the Certbot SSL lines exactly as they are.

```nginx
server {
    server_name veeshal.me www.veeshal.me;

    # Static files Next serves with content hashes (immutable, cached hard)
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3002;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Everything else → Next.js
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/veeshal.me/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/veeshal.me/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.veeshal.me) { return 301 https://$host$request_uri; }
    if ($host = veeshal.me)     { return 301 https://$host$request_uri; }
    listen 80;
    server_name veeshal.me www.veeshal.me;
    return 404;
}
```

Apply:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Visit https://veeshal.me — it's now served by Next.js.

### Rollback (if needed)
```bash
cd /var/www/veeshal
git checkout <old-php-commit>            # the SHA you noted above
sudo cp ~/veeshal-nginx-php.bak /etc/nginx/sites-enabled/veeshal
sudo systemctl reload nginx
sudo systemctl restart php8.4-fpm
```

---

## 6. CI deploys (already wired)

`.github/workflows/deploy.yml` now runs, on every push to `main`:

```yaml
cd ${{ secrets.VPS_PATH }}
git pull origin main
npm ci
npm run build
sudo systemctl restart veeshal-next
```

Give the deploy user passwordless restart rights for just this unit
(`sudo visudo`, add):

```
www-data ALL=(ALL) NOPASSWD: /bin/systemctl restart veeshal-next
```

Once Next is live you can `sudo systemctl disable --now php8.4-fpm` and
`sudo apt remove php8.4-fpm` if nothing else on the box uses PHP.

---

## Why this kills your cache problem

- Next fingerprints its own CSS/JS (`/_next/static/...[hash]`) → browsers
  always fetch the new version after a deploy. No hard refresh, ever.
- Your reused `/js/*.js` get a `?v=<deploy id>` query (see `app/Scripts.tsx`),
  so they bust on every restart too.
- Supabase content still refreshes every 120s with no rebuild (ISR), same as
  the old PHP disk-cache TTL.
