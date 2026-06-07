import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    text: "Test response - nếu thấy dòng này thì API hoạt động!"
  });
}
