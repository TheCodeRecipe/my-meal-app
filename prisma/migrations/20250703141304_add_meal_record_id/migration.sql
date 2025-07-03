/*
  Warnings:

  - You are about to drop the column `mealId` on the `FoodRecord` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoodRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weight" INTEGER NOT NULL,
    "mealRecordId" INTEGER,
    "foodId" INTEGER NOT NULL,
    CONSTRAINT "FoodRecord_mealRecordId_fkey" FOREIGN KEY ("mealRecordId") REFERENCES "MealRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FoodRecord_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FoodRecord" ("foodId", "id", "weight") SELECT "foodId", "id", "weight" FROM "FoodRecord";
DROP TABLE "FoodRecord";
ALTER TABLE "new_FoodRecord" RENAME TO "FoodRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
