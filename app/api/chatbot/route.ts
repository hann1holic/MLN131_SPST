import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

import { ATLAS_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { atlasTools } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function checkRateLimit(clientId: string) {
  const now = Date.now();
  const current = rateLimit.get(clientId);
  if (!current || current.resetAt <= now) {
    rateLimit.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(clientId)) {
    return NextResponse.json({ error: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau." }, { status: 429 });
  }

  const { messages, contextCountry } = await req.json();
  console.log('🤖 Chatbot API called:', { messagesCount: messages?.length, contextCountry });

  if (!messages || !messages.length) {
    return NextResponse.json({ error: "Vui lòng gửi ít nhất một tin nhắn." }, { status: 400 });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 API Key check:', apiKey ? 'Có API key' : 'Không có API key');
    if (!apiKey) {
      console.log('❌ Không tìm thấy OPENAI_API_KEY');
      return NextResponse.json({
        text: "Atlas AI chưa sẵn sàng. Hãy cung cấp khóa OpenAI để bật phần trò chuyện thông minh."
      });
    }

    const systemPrompt = contextCountry
      ? `${ATLAS_SYSTEM_PROMPT}\n\nNgữ cảnh hiện tại: Người dùng đang xem thông tin về quốc gia: ${contextCountry}.`
      : ATLAS_SYSTEM_PROMPT;

    // Transform messages từ format { parts: [] } sang { content: string }
    const transformedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.parts
        ? msg.parts.map((p: any) => p.text).join('\n')
        : msg.text || ''
    }));

    console.log('📨 Transformed messages:', transformedMessages);

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: transformedMessages,
      temperature: 0.25,
    });

    const text = await result.text;
    console.log('✅ Got response text:', text);

    return NextResponse.json({
      text: text
    });
  } catch (error) {
    console.error("Atlas AI error:", error);
    return NextResponse.json(
      {
        error: "Yêu cầu Atlas AI thất bại.",
        details: error instanceof Error ? error.message : "Lỗi chưa xác định"
      },
      { status: 500 }
    );
  }
}
