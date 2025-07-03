import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const foods = await prisma.food.findMany();
    return NextResponse.json(foods);
  } catch (err) {
    console.error("음식 불러오기 실패:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
