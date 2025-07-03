"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const target = {
    carbs: 300,
    protein: 100,
    fat: 50,
    kcal: 2000,
  };

  const [meal, setMeal] = useState<{
    menu: string;
    allergens: string;
  } | null>(null);

  const [today, setToday] = useState(new Date());

  const [nutrientTotal, setNutrientTotal] = useState<{
    carbs: number;
    protein: number;
    fat: number;
    kcal: number;
    weight: number;
  } | null>(null);

  const fetchMeal = async () => {
    const res = await fetch("/api/meal");
    const data = await res.json();
    const rawMenu: string = data.menu || "";

    const unifiedMenu = rawMenu.replace(/<br\s*\/?>/gi, " / ");
    const items: string[] = unifiedMenu.split(" / ");

    const allergenSet = new Set<string>();
    const cleanedItems: string[] = [];

    items.forEach((item: string) => {
      const match = item.match(/(.*?)(\d+(\.\d+)*\.)?$/);
      if (match) {
        const name = match[1].trim();
        const allergyString = match[2] || "";
        const codes = allergyString
          .split(".")
          .filter((code) => code !== "")
          .map((code) => code.trim());

        codes.forEach((code) => allergenSet.add(code));
        cleanedItems.push(name);
      } else {
        cleanedItems.push(item.trim());
      }
    });

    setMeal({
      menu: cleanedItems.join(" / "),
      allergens:
        [...allergenSet].sort((a, b) => Number(a) - Number(a)).join(" / ") ||
        "없음",
    });
  };

  const fetchNutrientSummary = async () => {
    const dateString = today.toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    }); // 'YYYY-MM-DD' 형식 반환됨
    const res = await fetch(`/api/meal-summary?date=${dateString}`);
    const data = await res.json();
    setNutrientTotal(data.total);
  };

  useEffect(() => {
    fetchMeal();
    fetchNutrientSummary();
  }, [today]);

  const getKoreanDay = (dayIdx: number) => {
    return ["일", "월", "화", "수", "목", "금", "토"][dayIdx];
  };

  const getWeekDates = (baseDate: Date) => {
    const start = new Date(baseDate);
    const day = start.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    start.setDate(start.getDate() + diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates(today);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-white px-5 pt-4 pb-8 gap-6">
      <div className="flex justify-between items-center text-[18px] font-bold">
        <button className="text-black">←</button>
        <Link href="/meal-list">
          <button className="text-[20px]">≡</button>
        </Link>
      </div>

      <div className="flex items-center gap-1 text-[15px] font-medium text-[#2b2b2b]">
        <span>
          {today.getMonth() + 1}.{today.getDate()}{" "}
          {getKoreanDay(today.getDay())}
        </span>
      </div>

      <div className="flex justify-between items-center text-[12px] font-medium">
        {weekDates.map((date) => {
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

          return (
            <div
              key={date.toDateString()}
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => setToday(date)}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-[#00a99d] text-white" : ""
                }`}
              >
                {getKoreanDay(date.getDay())}
              </span>
              <div className="text-[10px]">{date.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="border border-2 border-[#00a99d] rounded-xl p-4">
        <div className="flex justify-between items-center font-semibold text-[15px]">
          <span className="text-[#2b2b2b]">급식 메뉴</span>
          <button className="text-[11px] text-white bg-[#00a99d] rounded px-2 py-0.5">
            기록하기
          </button>
        </div>
        <div className="text-[13px] mt-2 leading-relaxed text-[#2b2b2b]">
          {meal ? meal.menu : "로딩 중..."}
        </div>
        <div className="text-[11px] text-[#9c9c9c] mt-2">
          알레르기 주의 물질
          <br />
          {meal ? meal.allergens : "로딩 중..."}
        </div>
      </div>

      <Link href="/meal-record" className="block">
        <div className="flex items-center justify-between bg-white shadow-md rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#f0f9ec] flex items-center justify-center mr-3">
              <span className="text-[24px]">🥦</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] text-[#6b6b6b]">
                건강한 습관을 만드는
              </span>
              <span className="text-[16px] font-semibold text-[#2b2b2b]">
                오늘 식단 기록하기
              </span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#d9d9d9] flex items-center justify-center ml-4">
            <span className="text-white text-sm font-bold">+</span>
          </div>
        </div>
      </Link>

      <div className="text-[14px] font-semibold text-[#2b2b2b]">
        목표 섭취 영양
      </div>
      <div className="p-4 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-[#ff8229] text-white text-[13px] rounded-full flex items-center justify-center font-bold">
                탄
              </span>
              <span className="font-bold text-[#2b2b2b]">
                {nutrientTotal
                  ? Math.round((nutrientTotal.carbs / target.carbs) * 100)
                  : 0}
                %
              </span>
              <span className="text-[12px] text-[#9b9b9b] font-medium">
                {nutrientTotal?.carbs ?? 0} / {target.carbs}g
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-[#5dd45e] text-white text-[13px] rounded-full flex items-center justify-center font-bold">
                단
              </span>
              <span className="font-bold text-[#2b2b2b]">
                {nutrientTotal
                  ? Math.round((nutrientTotal.protein / target.protein) * 100)
                  : 0}
                %
              </span>
              <span className="text-[12px] text-[#9b9b9b] font-medium">
                {nutrientTotal?.protein ?? 0} / {target.protein}g
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-[#f7ca3e] text-white text-[13px] rounded-full flex items-center justify-center font-bold">
                지
              </span>
              <span className="font-bold text-[#2b2b2b]">
                {nutrientTotal
                  ? Math.round((nutrientTotal.fat / target.fat) * 100)
                  : 0}
                %
              </span>
              <span className="text-[12px] text-[#9b9b9b] font-medium">
                {nutrientTotal?.fat ?? 0} / {target.fat}g
              </span>
            </div>
          </div>
          <div className="relative">
            <svg className="w-[90px] h-[90px]" viewBox="0 0 36 36">
              <path
                className="text-[#f0f0f0]"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#aee936]"
                strokeWidth="4"
                strokeDasharray={`${
                  nutrientTotal ? (nutrientTotal.kcal / target.kcal) * 100 : 0
                }, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-center">
              <div className="text-[16px] font-bold text-[#2b2b2b]">
                {nutrientTotal?.kcal ?? 0}
              </div>
              <div className="text-[12px] text-[#bcbcbc]">{target.kcal}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
