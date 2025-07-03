// app/api/meal/route.ts
import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function GET() {
  const res = await fetch(
    `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=T10&SD_SCHUL_CODE=9290083&Type=xml&MLSV_FROM_YMD=20210101&MLSV_TO_YMD=20250101`,
    { cache: "no-store" }
  );

  const xmlText = await res.text();
  const result = await parseStringPromise(xmlText);
  const rows = result?.mealServiceDietInfo?.row;

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "No meal data found" }, { status: 404 });
  }

  const latest = rows.at(-1);

  return NextResponse.json({
    date: latest.MLSV_YMD?.[0],
    menu: latest.DDISH_NM?.[0], // HTML 포함됨
    calories: latest.CAL_INFO?.[0],
    nutrients: latest.NTR_INFO?.[0],
  });
}
