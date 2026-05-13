#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$ROOT_DIR"

case "${1:-}" in
  "")
    docker compose run --rm certbot renew
    docker compose exec -T nginx nginx -s reload
    echo "renew-cert: done (renew + nginx reload)"
    ;;
  --dry-run)
    docker compose run --rm certbot renew --dry-run
    echo "renew-cert: dry-run OK (no cert or nginx changes)"
    ;;
  *)
    echo "Usage: $0 [--dry-run]" >&2
    exit 1
    ;;
esac
