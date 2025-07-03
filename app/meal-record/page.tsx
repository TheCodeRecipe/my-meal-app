"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FoodItem {
  id: number;
  name: string;
  weight: number;
  carbs: number;
  protein: number;
  fat: number;
  kcal: number;
}

const mealTypeMap: Record<string, string> = {
  B: "아침",
  L: "점심",
  D: "저녁",
  S: "간식",
};

export default function MealRecordPage() {
  const [userId] = useState(1);

  const [selectedMeal, setSelectedMeal] = useState("L");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchText, setSearchText] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchMealRecord = async () => {
      try {
        const res = await fetch(
          `/api/meal-record?userId=${userId}&mealType=${selectedMeal}`
        );
        if (!res.ok) throw new Error("식사 기록 불러오기 실패");

        const data = await res.json();

        const convertedFoods = data.foodRecords.map((fr: any) => ({
          id: fr.food.id,
          name: fr.food.name,
          weight: fr.weight,
          carbs: fr.food.carbs,
          protein: fr.food.protein,
          fat: fr.food.fat,
          kcal: fr.food.kcal,
        }));

        setFoods(convertedFoods);
      } catch (err) {
        console.error("기록 불러오기 실패:", err);
        setFoods([]);
      }
    };

    fetchMealRecord();
  }, [selectedMeal, userId]);

  const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);

  useEffect(() => {
    fetch("/api/foods")
      .then((res) => res.json())
      .then((data) => setAvailableFoods(data))
      .catch((err) => console.error("음식 데이터 불러오기 실패:", err));
  }, []);

  const handleChangeWeight = (id: number, diff: number) => {
    setFoods((prev) =>
      prev.map((food) => {
        if (food.id === id) {
          const newWeight = Math.max(0, food.weight + diff);

          const original = availableFoods.find((f) => f.id === food.id);
          if (!original || original.weight === 0) return food;

          const factor = newWeight / original.weight;

          return {
            ...food,
            weight: newWeight,
            carbs: Math.round(original.carbs * factor),
            protein: Math.round(original.protein * factor),
            fat: Math.round(original.fat * factor),
            kcal: Math.round(original.kcal * factor),
          };
        }
        return food;
      })
    );
  };

  const handleAddFood = (food: FoodItem) => {
    setFoods((prev) => [...prev, food]);
  };

  const handleRemoveFood = (id: number) => {
    setFoods((prev) => prev.filter((food) => food.id !== id));
  };

  const handleSave = async () => {
    try {
      const payload = {
        userId,
        mealType: selectedMeal,
        foods: foods.map((f) => ({
          id: f.id,
          weight: f.weight,
        })),
      };

      const res = await fetch("/api/meal-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("저장 실패");

      alert("저장 완료");
    } catch (err) {
      console.error("저장 실패:", err);
      alert("오류 발생");
    }
  };

  const addedFoodIds = foods.map((f) => f.id);
  const filteredFoods = availableFoods.filter(
    (f) =>
      !addedFoodIds.includes(f.id) &&
      f.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalCarbs = foods.reduce((acc, f) => acc + f.carbs, 0);
  const totalProtein = foods.reduce((acc, f) => acc + f.protein, 0);
  const totalFat = foods.reduce((acc, f) => acc + f.fat, 0);
  const totalKcal = foods.reduce((acc, f) => acc + f.kcal, 0);
  const totalMacro = totalCarbs + totalProtein + totalFat;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 sm:px-6 pt-4 pb-36 bg-white text-[#2b2b2b] text-[14px]">
      <div className="flex items-center w-full pb-6">
        {/* 검색창 */}
        <div className="flex items-center flex-1 h-10 bg-[#f5f5f5] rounded-full px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-[#c4c4c4] mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            />
          </svg>
          <input
            type="text"
            placeholder="음식명, 브랜드명으로 검색"
            className="flex-1 bg-transparent text-[13px] placeholder-[#c4c4c4] text-[#2b2b2b] focus:outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            className="w-5 h-5 flex items-center justify-center rounded-full bg-[#d9d9d9] text-white text-sm"
            onClick={() => setSearchText("")}
          >
            ×
          </button>
        </div>

        {/* 취소 버튼 */}
        <button
          onClick={() => router.push("/")}
          className="ml-2 text-[14px] text-[#4a4a4a] font-medium"
        >
          취소
        </button>
      </div>

      {/* 검색 결과 */}
      {searchText && (
        <div className="space-y-2 mb-6">
          <div className="text-[13px] mb-1">검색 결과</div>
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <div
                key={food.id}
                className="bg-[#f8f8f8] px-4 py-2 rounded-lg shadow cursor-pointer"
                onClick={() => handleAddFood(food)}
              >
                {food.name}
              </div>
            ))
          ) : (
            <div className="text-[#9c9c9c] text-[13px]">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 식사 선택 */}
      <div className="flex justify-between gap-3 px-2 mb-6">
        {["B", "L", "D", "S"].map((code) => (
          <button
            key={code}
            className={`px-4 py-1 rounded-lg shadow-sm text-[13px] font-medium ${
              selectedMeal === code
                ? "bg-[#33c481] text-white"
                : "bg-white text-[#9c9c9c]"
            }`}
            onClick={() => setSelectedMeal(code)}
          >
            {mealTypeMap[code]}
          </button>
        ))}
      </div>

      {/* 열량 정보 */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-[14px] font-semibold">
          <span>총 열량</span>
          <span className="text-[18px] text-[#2b2b2b] font-bold">
            {totalKcal} kcal
          </span>
        </div>
        <div className="relative w-full h-6 rounded-full bg-[#f4f4f4] overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#ff8229]"
            style={{ width: `${(totalCarbs / totalMacro) * 100 || 0}%` }}
          />
          <div
            className="absolute left-0 top-0 h-full bg-[#aee936]"
            style={{
              left: `${(totalCarbs / totalMacro) * 100 || 0}%`,
              width: `${(totalProtein / totalMacro) * 100 || 0}%`,
            }}
          />
          <div
            className="absolute left-0 top-0 h-full bg-[#f7ca3e]"
            style={{
              left: `${((totalCarbs + totalProtein) / totalMacro) * 100 || 0}%`,
              width: `${(totalFat / totalMacro) * 100 || 0}%`,
            }}
          />
        </div>
        <div className="flex gap-4 text-[13px] mt-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#ff8229] rounded-[3px]" />
            <span>탄 {totalCarbs}g</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#aee936] rounded-[3px]" />
            <span>단 {totalProtein}g</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#f7ca3e] rounded-[3px]" />
            <span>지 {totalFat}g</span>
          </div>
        </div>
      </div>

      {/* 섭취 음식 */}
      <div className="flex justify-between items-center text-[13px] mb-2">
        <span>섭취 음식</span>
        <span className="text-[#bcbcbc]">{foods.length}개</span>
      </div>

      {/* 음식 목록 */}
      <div className="space-y-4">
        {foods.map((food) => (
          <div key={food.id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between font-medium mb-2">
              <span className="truncate w-4/5">{food.name}</span>
              <button
                className="text-red-500 text-xl"
                onClick={() => handleRemoveFood(food.id)}
              >
                −
              </button>
            </div>
            <div className="text-[#9c9c9c] text-[13px] mb-2">섭취중량(g)</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChangeWeight(food.id, -10)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#eeeeee] text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={food.weight}
                readOnly
                className="w-[90px] h-9 text-center rounded-full bg-[#f5f5f5] text-[14px]"
              />
              <button
                onClick={() => handleChangeWeight(food.id, 10)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#eeeeee] text-lg"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <button
          className="w-full py-3 rounded-full bg-[#33c481] text-white font-semibold text-[14px]"
          onClick={handleSave}
        >
          저장
        </button>
      </div>
    </div>
  );
}
