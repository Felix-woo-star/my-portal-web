#!/bin/sh
set -e

echo "Starting application..."

run_prisma() {
  if [ -x ./node_modules/.bin/prisma ]; then
    ./node_modules/.bin/prisma "$@"
  else
    npx --no-install prisma "$@"
  fi
}

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Waiting for database to be ready..."

  # pg_isready does not handle Prisma query params like ?schema=public reliably.
  DB_CHECK_URL="${DATABASE_URL%%\?*}"

  until pg_isready -d "$DB_CHECK_URL" > /dev/null 2>&1; do
    echo "Database is unavailable - sleeping"
    sleep 1
  done
  echo "Database is ready!"

  echo "Generating Prisma client..."
  run_prisma generate

  echo "Running Prisma migrations..."
  if run_prisma migrate deploy; then
    echo "Prisma migrations completed successfully!"
  else
    echo "Warning: Prisma migration had issues, attempting db push..."
    run_prisma db push --skip-generate || echo "Both migration methods failed, proceeding anyway..."
  fi
else
  echo "DATABASE_URL is not set. Skipping Prisma setup."
fi

echo "Starting Next.js server..."
exec node server.js
