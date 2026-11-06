-- Reverses 20261105120000_add_update_subscriber. Drops the launch-update sign-ups and their status
-- type; nothing else depends on either. Run with: npx prisma db execute --file <this file>
DROP TABLE IF EXISTS "update_subscriber";
DROP TYPE IF EXISTS "update_subscriber_status";
