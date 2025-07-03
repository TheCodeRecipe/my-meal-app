/*
  Warnings:

  - You are about to drop the column `carbs` on the `FoodRecord` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `FoodRecord` table. All the data in the column will be lost.
  - You are about to drop the column `kcal` on the `FoodRecord` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `FoodRecord` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `FoodRecord` table. All the data in the column will be lost.
  - Added the required column `foodId` to the `FoodRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MealRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Food" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "kcal" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoodRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mealId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    CONSTRAINT "FoodRecord_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "MealRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoodRecord_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FoodRecord" ("id", "mealId", "weight") SELECT "id", "mealId", "weight" FROM "FoodRecord";
DROP TABLE "FoodRecord";
ALTER TABLE "new_FoodRecord" RENAME TO "FoodRecord";
CREATE TABLE "new_MealRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MealRecord" ("createdAt", "id", "mealType") SELECT "createdAt", "id", "mealType" FROM "MealRecord";
DROP TABLE "MealRecord";
ALTER TABLE "new_MealRecord" RENAME TO "MealRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
