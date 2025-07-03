import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 유저가 없으면 생성
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "테스트 유저",
    },
  });

  // 샘플 푸드 데이터
  const sampleFoodItems = [
    {
      id: 1,
      name: "와우닭 큐브 닭가슴살 갈릭맛",
      weight: 70,
      carbs: 1,
      protein: 15,
      fat: 1,
      kcal: 80,
    },
    {
      id: 2,
      name: "샐러드 토퍼 선드라이드 토마토&",
      weight: 30,
      carbs: 2,
      protein: 3,
      fat: 0,
      kcal: 40,
    },
    {
      id: 3,
      name: "오트밀 바나나",
      weight: 50,
      carbs: 30,
      protein: 5,
      fat: 3,
      kcal: 200,
    },
    {
      id: 4,
      name: "닭가슴살 스테이크",
      weight: 100,
      carbs: 1,
      protein: 25,
      fat: 2,
      kcal: 150,
    },
    {
      id: 5,
      name: "요거트 플레인",
      weight: 150,
      carbs: 12,
      protein: 8,
      fat: 3,
      kcal: 120,
    },
  ];

  // 푸드 항목 upsert
  await Promise.all(
    sampleFoodItems.map((item) =>
      prisma.food.upsert({
        where: { id: item.id },
        update: {},
        create: item,
      })
    )
  );
}

main()
  .then(() => {
    console.log("✅ 시드 데이터 삽입 완료");
  })
  .catch((e) => {
    console.error("❌ 시딩 중 에러 발생:", e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
