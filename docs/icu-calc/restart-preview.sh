#!/bin/bash
# One command to bring the live preview back after a sandbox restart.
#   bash /home/user/icu-calc/restart-preview.sh
sudo cp /home/user/icu-calc/icu-preview.service /etc/systemd/system/icu-preview.service
sudo systemctl daemon-reload
sudo systemctl enable --now icu-preview.service >/dev/null 2>&1
sleep 1
systemctl is-active icu-preview.service | sed 's/^/systemd service: /'
for p in 8000 8080; do
  code=$(curl -s -o /dev/null -m 4 -w '%{http_code}' "http://127.0.0.1:$p/" || echo 000)
  echo "port $p -> HTTP $code"
done
