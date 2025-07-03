import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 타입 정의
type MealItem = {
  id: number;
  name: string;
  kcal: number;
  weight: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar?: number;
};

type MealsByType = Record<"B" | "L" | "D" | "S", MealItem[]>;
type MealRecordWithFood = {
  mealType: "B" | "L" | "D" | "S";
  foodRecords: {
    id: number;
    food: {
      name: string;
      kcal: number;
      weight: number;
      carbs: number;
      protein: number;
      fat: number;
      sugar?: number;
    };
  }[];
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json({ error: "날짜가 필요합니다." }, { status: 400 });
  }

  const date = new Date(dateParam);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  try {
    const mealRecords = await prisma.mealRecord.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        foodRecords: {
          include: {
            food: true,
          },
        },
      },
    });

    // 요약 및 분류 로직 시작
    const result: MealsByType = { B: [], L: [], D: [], S: [] };

    let totalKcal = 0;
    let totalWeight = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;

    mealRecords.forEach((record: MealRecordWithFood) => {
      const key = record.mealType as keyof MealsByType;

      const foods: MealItem[] = record.foodRecords.map((fr) => {
        const food = fr.food;

        totalKcal += food.kcal;
        totalWeight += food.weight;
        totalCarbs += food.carbs;
        totalProtein += food.protein;
        totalFat += food.fat;

        return {
          id: fr.id,
          name: food.name,
          kcal: food.kcal,
          weight: food.weight,
          carbs: food.carbs,
          protein: food.protein,
          fat: food.fat,
          sugar: food.sugar,
        };
      });

      result[key].push(...foods);
    });
    console.log("데이터1", totalKcal);
    console.log("데이터2", result);
    // 프론트에 넘길 데이터
    return NextResponse.json({
      total: {
        kcal: totalKcal,
        weight: totalWeight,
        carbs: totalCarbs,
        protein: totalProtein,
        fat: totalFat,
      },
      meals: result,
    });
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
