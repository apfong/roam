#!/usr/bin/env bash
# Pull secrets from Doppler and write to ~/roam/.env
set -euo pipefail

TOKEN=$(cat ~/.config/doppler/token)
SECRETS=$(curl -s --request GET \
  --url "https://api.doppler.com/v3/configs/config/secrets/download" \
  --header "authorization: Bearer $TOKEN" \
  --header "accept: application/json")

# Write .env
echo "# Auto-pulled from Doppler — $(date -Iseconds)" > ~/roam/.env
echo "$SECRETS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for k, v in sorted(d.items()):
    if not k.startswith('DOPPLER_'):
        print(f'{k}={v}')
" >> ~/roam/.env

chmod 600 ~/roam/.env
echo "✅ Secrets written to ~/roam/.env"
