import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, mealType, foods } = body;

    // KST 기준 날짜
    const kstNow = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);

    // 오늘 날짜만 비교 (createdAt 기준)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 기존 기록 있는지 확인
    const existing = await prisma.mealRecord.findFirst({
      where: {
        userId,
        mealType,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        foodRecords: true,
      },
    });

    let meal;

    if (existing) {
      // 기존 기록이 있으면: 기존 foodRecords 삭제 → 새로 생성
      await prisma.foodRecord.deleteMany({
        where: {
          mealRecordId: existing.id,
        },
      });

      meal = await prisma.mealRecord.update({
        where: { id: existing.id },
        data: {
          createdAt: kstNow,
          foodRecords: {
            create: foods.map((f: any) => ({
              food: { connect: { id: f.id } },
              weight: f.weight,
            })),
          },
        },
        include: {
          foodRecords: {
            include: { food: true },
          },
        },
      });
    } else {
      // 기존 기록 없으면 새로 생성
      meal = await prisma.mealRecord.create({
        data: {
          userId,
          mealType,
          createdAt: kstNow,
          foodRecords: {
            create: foods.map((f: any) => ({
              food: { connect: { id: f.id } },
              weight: f.weight,
            })),
          },
        },
        include: {
          foodRecords: {
            include: { food: true },
          },
        },
      });
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("저장 실패:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// app/api/meal-record/route.ts (GET 핸들러)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const mealType = searchParams.get("mealType");

  if (!userId || !mealType) {
    return NextResponse.json({ error: "유효하지 않은 요청" }, { status: 400 });
  }

  try {
    const meal = await prisma.mealRecord.findFirst({
      where: {
        userId,
        mealType,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: {
        foodRecords: {
          include: { food: true },
        },
      },
    });

    if (!meal) {
      return NextResponse.json({ foodRecords: [] }); // 빈 배열
    }

    return NextResponse.json(meal);
  } catch (err) {
    console.error("기록 불러오기 실패:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
