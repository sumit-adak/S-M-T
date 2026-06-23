# VPS Go-Live — remaining steps

> **How to read this file**
> - Every grey block below is **a terminal command** — copy the whole block and paste it into your VPS SSH session, then press Enter.
> - You never open a text editor. The blocks that start with `sudo tee … <<'EOF'` **write a file for you**; everything between `<<'EOF'` and the closing `EOF` is the file's contents being saved automatically. Just paste the whole block.
> - ✅ lines under a command are **what you should see** if it worked.

You've already done: `git pull`, `npm ci`, `npm run build`. Now: **Phase A** (run the app as a service), then **Phase B** (point nginx at it).

---

## Phase A — run Next.js as a background service

### A1. Let the web user own the app folder (Next writes its cache here)

```bash
sudo chown -R www-data:www-data /var/www/veeshal
```

### A2. Create the service (paste the whole block — it writes the file for you)

```bash
sudo tee /etc/systemd/system/veeshal-next.service > /dev/null <<'EOF'
[Unit]
Description=veeshal.me Next.js
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/veeshal
ExecStart=/usr/bin/env npm run start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF
```

### A3. Start it (now + on every reboot)

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now veeshal-next
sudo systemctl status veeshal-next --no-pager
```

✅ Look for `active (running)`.

### A4. Confirm it's serving (your old PHP site is still public right now)

```bash
wget -qO- http://127.0.0.1:3000 | head -c 300; echo
```

✅ You should see HTML starting with `<!DOCTYPE html>`.
❌ If not, run this and read the error:

```bash
sudo journalctl -u veeshal-next -n 30 --no-pager
```

---

## Phase B — switch nginx over to Next.js

### B1. Back up the current (PHP) nginx config — makes rollback instant

```bash
sudo cp /etc/nginx/sites-enabled/veeshal ~/veeshal-nginx-php.bak
```

### B2. Write the new reverse-proxy config (paste the whole block — keeps your SSL)

```bash
sudo tee /etc/nginx/sites-enabled/veeshal > /dev/null <<'EOF'
server {
    server_name veeshal.me www.veeshal.me;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/veeshal.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/veeshal.me/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.veeshal.me) { return 301 https://$host$request_uri; }
    if ($host = veeshal.me)     { return 301 https://$host$request_uri; }
    listen 80;
    server_name veeshal.me www.veeshal.me;
    return 404;
}
EOF
```

### B3. Test the config and reload nginx

```bash
sudo nginx -t && sudo systemctl reload nginx
```

✅ `nginx -t` must say `syntax is ok` / `test is successful`.

### B4. Done — open the site

Open **https://veeshal.me** in your browser and click around: `/projects`, `/blogs`, `/timeline`, `/chaicode`, `/vee`.

---

## Rollback (only if something looks broken)

```bash
sudo cp ~/veeshal-nginx-php.bak /etc/nginx/sites-enabled/veeshal
sudo nginx -t && sudo systemctl reload nginx
```

(Your old PHP-FPM never stopped, so this puts the old site back immediately.)

---

## After the site is confirmed working (do these later, not now)

### Let auto-deploy restart the service on each `git push`

```bash
echo 'www-data ALL=(ALL) NOPASSWD: /bin/systemctl restart veeshal-next' | sudo tee /etc/sudoers.d/veeshal-next
```

(Your GitHub Action already runs `git pull → npm ci → npm run build → systemctl restart veeshal-next`.)

### Patch the Next.js security warning

```bash
cd /var/www/veeshal
npm i next@15.1.8
npm run build
sudo systemctl restart veeshal-next
```

### Optional: turn off PHP if nothing else uses it

```bash
sudo systemctl disable --now php8.4-fpm
```

---

## Everyday deploy (future updates)

Once set up, every push to `main` auto-deploys via GitHub Actions. To deploy by hand:

```bash
cd /var/www/veeshal
git pull origin main
npm ci
npm run build
sudo systemctl restart veeshal-next
```
