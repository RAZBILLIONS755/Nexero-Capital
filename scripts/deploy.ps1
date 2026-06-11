# PowerShell deploy helper (run locally)
# - Requires git installed. Optional: GitHub CLI `gh` for automatic repo creation.

param(
  [string]$RepoName = "",
  [string]$RemoteUrl = ""
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "git not found. Install git and run this script again." -ForegroundColor Yellow
  exit 1
}

# Initialize git if needed
if (-not (Test-Path .git)) {
  git init
}

git add .
if (-not (git rev-parse --verify HEAD 2>$null)) {
  git commit -m "Prepare for Cloudflare Pages deploy" || Write-Host "No changes to commit."
} else {
  git commit -m "Prepare for Cloudflare Pages deploy" || Write-Host "No new changes to commit."
}

# Create remote via gh if available and no remote provided
if (-not $RemoteUrl -and (Get-Command gh -ErrorAction SilentlyContinue)) {
  if (-not $RepoName) { $RepoName = Read-Host "Enter GitHub repo name (user/repo or repo)" }
  gh repo create $RepoName --public --source=. --remote=origin --push
} else {
  if (-not $RemoteUrl) { $RemoteUrl = Read-Host "Enter remote URL (e.g. https://github.com/you/repo.git)" }
  if ($RemoteUrl) {
    git remote add origin $RemoteUrl -f 2>$null
    git branch -M main
    git push -u origin main
  } else {
    Write-Host "No remote provided; repository initialized locally. Push manually when ready." -ForegroundColor Yellow
  }
}

Write-Host "Build locally to verify: npm install && npm run build" -ForegroundColor Green
Write-Host "Then connect the GitHub repo to Cloudflare Pages (Build: npm run build; Output dir: dist)" -ForegroundColor Green
