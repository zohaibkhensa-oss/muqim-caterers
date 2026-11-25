#!/usr/bin/env bash
# Builds the app and publishes dist/ to the gh-pages branch.
# Supabase env vars come from .env.local (Vite loads it during build).
set -e
npm run build
cd dist
cp index.html 404.html          # SPA fallback for client-side routes
echo "www.mcaterers.in" > CNAME
git init -q && git checkout -q -b gh-pages
git add -A
git -c user.name="Devin" -c user.email="devin@cognition.ai" commit -qm "Deploy $(date +%Y-%m-%d\ %H:%M)"
git push -qf "https://github.com/zohaibkhensa-oss/muqim-caterers.git" gh-pages
cd .. && rm -rf dist/.git
echo "Deployed. Live at https://www.mcaterers.in once DNS is set."
