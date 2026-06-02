#!/usr/bin/env bash
# Creates (or updates) the GHCR image-pull secret in the settl namespace.
# Run once before the first deploy, or after rotating your PAT.
#
# Usage:
#   ./deploy/upload-config.sh <github-user> <github-pat>
set -euo pipefail

REMOTE="k3s-oracle-cloud"
GITHUB_USER="${1:?Usage: $0 <github-user> <github-pat>}"
GITHUB_PAT="${2:?Usage: $0 <github-user> <github-pat>}"

echo "Updating GHCR pull secret in k3s namespace 'settl'…"
ssh "$REMOTE" "
  sudo kubectl create secret docker-registry ghcr-secret \
    --docker-server=ghcr.io \
    --docker-username=$GITHUB_USER \
    --docker-password=$GITHUB_PAT \
    -n settl \
    --dry-run=client -o yaml | sudo kubectl apply -f -
"
echo "Done."
