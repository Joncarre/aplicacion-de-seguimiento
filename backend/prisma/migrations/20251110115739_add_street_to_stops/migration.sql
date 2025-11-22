/*
  Warnings:

  - Added the required column `street` to the `stops` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stops" ADD COLUMN     "street" TEXT NOT NULL;
