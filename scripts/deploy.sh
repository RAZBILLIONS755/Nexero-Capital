#!/usr/bin/env bash
# POSIX deploy helper (run locally). Requires git. Optional: gh CLI for automatic repo creation.
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git not found. Install git and run this script again." >&2
  exit 1
fi

REPO=${1:-}
REMOTE=${2:-}

if [ ! -d .git ]; then
  git init
fi

git add . || true
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git commit -m "Prepare for Cloudflare Pages deploy" || true
else
  git commit -m "Prepare for Cloudflare Pages deploy" || true
fi

if [ -z "$REMOTE" ] && command -v gh >/dev/null 2>&1; then
  if [ -z "$REPO" ]; then
    read -p "Enter GitHub repo name (user/repo or repo): " REPO
  fi
  gh repo create "$REPO" --public --source=. --remote=origin --push
elif [ -n "$REMOTE" ]; then
  git remote add origin "$REMOTE" 2>/dev/null || true
  git branch -M main
  git push -u origin main
else
  echo "No remote provided; repository initialized locally. Push manually when ready."
fi

echo "Build locally to verify: npm install && npm run build"
echo "Connect the GitHub repo to Cloudflare Pages (Build: npm run build; Output dir: dist)"
