"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

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

type MealsByType = {
  B: MealItem[];
  L: MealItem[];
  D: MealItem[];
  S: MealItem[];
};

type TotalNutrition = {
  kcal: number;
  weight: number;
  carbs: number;
  protein: number;
  fat: number;
};

export default function MealSummaryPage() {
  const [date, setDate] = useState(new Date());
  const [meals, setMeals] = useState<MealsByType>({
    B: [],
    L: [],
    D: [],
    S: [],
  });
  const [total, setTotal] = useState<TotalNutrition | null>(null);

  const handlePrevDate = () => {
    setDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const handleNextDate = () => {
    setDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const res = await fetch(`/api/meal-summary?date=${formattedDate}`);
        const data = await res.json();
        console.log("불러온데이터!", data);
        setMeals(data.meals);
        setTotal(data.total);
      } catch (err) {
        console.error("식사 정보 불러오기 실패:", err);
        setMeals({ B: [], L: [], D: [], S: [] });
        setTotal(null);
      }
    };
    fetchMeals();
  }, [date]);

  const renderMealSection = (title: string, mealKey: keyof MealsByType) => {
    const list = meals[mealKey] || [];
    if (list.length === 0) return null;

    return (
      <div>
        <div className="text-[14px] font-semibold mb-2 px-1">{title}</div>
        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-[#eeeeee]"
            >
              <div className="text-[15px] font-semibold truncate">
                {item.name}
              </div>
              <div className="flex justify-between mt-2 text-[13px]">
                <span className="text-[#6f6f6f]">
                  칼로리(kcal){" "}
                  <strong className="text-black ml-1">{item.kcal}</strong>
                </span>
                <span className="text-[#6f6f6f]">
                  섭취중량(g){" "}
                  <strong className="text-black ml-1">{item.weight}</strong>
                </span>
              </div>
              <div className="mt-1 text-[12px] text-[#9c9c9c]">
                탄수화물 {item.carbs} 단백질 {item.protein} 지방 {item.fat} 당류{" "}
                {item.sugar || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 text-[#2b2b2b] text-[14px] bg-white min-h-screen">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/">
          <button className="text-[20px] text-[#2b2b2b]">←</button>
        </Link>
        <button>
          {/* <img
            src="https://cdn-icons-png.flaticon.com/512/747/747310.png"
            alt="달력"
            className="w-5 h-5"
          /> */}
        </button>
      </div>

      {/* 날짜 선택 */}
      <div className="flex justify-center items-center gap-2 mb-6">
        <button onClick={handlePrevDate} className="text-[#9c9c9c]">
          ◀
        </button>
        <div className="px-4 py-1 rounded-full border border-[#dcdcdc] text-[14px] text-[#2b2b2b] font-medium">
          {format(date, "yyyy/MM/dd")}
        </div>
        <button onClick={handleNextDate} className="text-[#9c9c9c]">
          ▶
        </button>
      </div>

      {/* 총 섭취량 */}
      <div className="mb-6">
        <p className="text-[13px] text-[#00b564] font-semibold">총 섭취량</p>
        <p className="text-[22px] font-bold mt-1">
          {total ? `${total.kcal}kcal` : "- kcal"}{" "}
          <span className="font-normal text-[16px]">먹었어요!</span>
        </p>
        <p className="text-[13px] text-[#9c9c9c] mt-1">
          총 중량 : {total ? `${total.weight.toFixed(1)}g` : "- g"}
        </p>

        <div className="flex gap-4 text-[13px] mt-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#ff8229] rounded-[3px]" />
            <span>탄 {total ? `${total.carbs}g` : "- g"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#aee936] rounded-[3px]" />
            <span>단 {total ? `${total.protein}g` : "- g"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#f7ca3e] rounded-[3px]" />
            <span>지 {total ? `${total.fat}g` : "- g"}</span>
          </div>
        </div>
      </div>

      {/* 식사 섹션 */}
      <div className="space-y-6">
        {renderMealSection("아침", "B")}
        {renderMealSection("점심", "L")}
        {renderMealSection("저녁", "D")}
        {renderMealSection("간식", "S")}
      </div>
    </div>
  );
}
