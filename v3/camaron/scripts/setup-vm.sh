#!/bin/bash
# ============================================================
# Camaron — Oracle Cloud VM Bootstrap Script
# Run once as ubuntu user on a fresh Oracle Linux / Ubuntu 22 VM
# Usage: bash setup-vm.sh
# ============================================================
set -euo pipefail

echo "======================================"
echo "  Camaron VM Setup — $(date)"
echo "======================================"

# ── 1. System update ──────────────────────────────────────────────────────────
echo "[1/7] Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# ── 2. Install Docker ─────────────────────────────────────────────────────────
echo "[2/7] Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker ubuntu
  sudo systemctl enable docker
  sudo systemctl start docker
else
  echo "  Docker already installed, skipping."
fi

# ── 3. Install Docker Compose v2 ─────────────────────────────────────────────
echo "[3/7] Installing Docker Compose..."
if ! docker compose version &>/dev/null; then
  COMPOSE_VER="2.29.7"
  sudo curl -SL \
    "https://github.com/docker/compose/releases/download/v${COMPOSE_VER}/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
else
  echo "  Docker Compose already installed."
fi

# ── 4. Install Certbot (SSL) ──────────────────────────────────────────────────
echo "[4/7] Installing Certbot..."
sudo snap install --classic certbot 2>/dev/null || true
sudo ln -sf /snap/bin/certbot /usr/bin/certbot 2>/dev/null || true

# ── 5. Open firewall ports (Oracle Cloud uses iptables rules) ────────────────
echo "[5/7] Configuring firewall..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
sudo netfilter-persistent save 2>/dev/null || true

# ── 6. Create app directory ───────────────────────────────────────────────────
echo "[6/7] Creating app directory..."
mkdir -p ~/camaron
cd ~/camaron

# ── 7. Create .env file template ─────────────────────────────────────────────
echo "[7/7] Writing .env template..."
if [ ! -f ~/camaron/backend/.env ]; then
  mkdir -p ~/camaron/backend
  cat > ~/camaron/backend/.env << 'EOF'
NODE_ENV=production
PORT=4000
API_PREFIX=/api/v1

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=camaron
POSTGRES_USER=camaron_user
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

JWT_SECRET=CHANGE_THIS_64_CHAR_RANDOM_STRING_MINIMUM_LENGTH_HERE_NOW
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=CHANGE_THIS_DIFFERENT_64_CHAR_RANDOM_STRING_FOR_REFRESH
JWT_REFRESH_EXPIRES_IN=7d

OTP_EXPIRES_MINUTES=10
OTP_LENGTH=6

SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1xxxxxxxxxx

BREVO_API_KEY=your_brevo_key
EMAIL_FROM=noreply@camaron.in
EMAIL_FROM_NAME=Camaron

FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com

LOG_LEVEL=info
LOG_DIR=./logs
EOF
  echo "  Created ~/camaron/backend/.env — PLEASE FILL IN YOUR SECRETS!"
else
  echo "  .env already exists, skipping."
fi

# Also write root .env for docker-compose postgres/redis passwords
if [ ! -f ~/camaron/.env ]; then
  cat > ~/camaron/.env << 'EOF'
POSTGRES_DB=camaron
POSTGRES_USER=camaron_user
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
VITE_API_URL=https://yourdomain.com/api/v1
EOF
fi

echo ""
echo "======================================"
echo "  Setup complete!"
echo ""
echo "  NEXT STEPS:"
echo "  1. Edit ~/camaron/backend/.env  — fill in all secrets"
echo "  2. Edit ~/camaron/.env          — match Postgres/Redis passwords"
echo "  3. Obtain SSL cert:"
echo "     sudo certbot certonly --standalone -d yourdomain.com"
echo "  4. Update nginx/nginx.conf with your domain"
echo "  5. Push code or pull docker-compose.yml then:"
echo "     cd ~/camaron && docker compose up -d"
echo ""
echo "  Oracle Cloud Security List — ensure these are open:"
echo "    TCP 80  (HTTP)"
echo "    TCP 443 (HTTPS)"
echo "======================================"
