/*
  Warnings:

  - You are about to drop the `server` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "service_chat"."room" DROP CONSTRAINT "room_serverId_fkey";

-- DropTable
DROP TABLE "service_chat"."server";

-- CreateTable
CREATE TABLE "service_chat"."chat_servers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_servers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_chat"."room" ADD CONSTRAINT "room_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "service_chat"."chat_servers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
