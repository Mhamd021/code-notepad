set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting NestJS application..."
exec npm run start:prod
