-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('INVOICE', 'WITHDRAWAL', 'TRANSFER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SETTLED', 'PENDING', 'FAILED', 'CANCELED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "publicKey" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "profileImage" TEXT,
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "k1Hash" TEXT NOT NULL,
    "publicKey" TEXT,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "maxAgeSeconds" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "transactionKind" "TransactionKind" NOT NULL,
    "transactionStatus" "TransactionStatus" NOT NULL,
    "hash" TEXT NOT NULL,
    "bolt11" TEXT NOT NULL,
    "lndId" TEXT NOT NULL,
    "k1Hash" TEXT,
    "mSatsTarget" INTEGER NOT NULL,
    "mSatsSettled" INTEGER,
    "userId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_publicKey_key" ON "User"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_k1Hash_key" ON "UserAuth"("k1Hash");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_lndId_key" ON "Transaction"("lndId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_k1Hash_key" ON "Transaction"("k1Hash");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
