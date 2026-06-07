"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: string; text: string }>;
}

export function AtlasChatbot({
  contextCountry,
  compact = false
}: {
  contextCountry?: string;
  compact?: boolean;
}) {
  const [input, setInput] = useState(contextCountry ? `Giải thích hồ sơ chính trị của ${contextCountry}` : "");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      parts: [{ type: "text", text: "Atlas AI sẵn sàng hỗ trợ. Hãy hỏi theo nhiều lớp: hệ tư tưởng, hình thức nhà nước, cơ cấu quyền lực, lãnh đạo, kinh tế và tài liệu tham khảo." }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limit visible messages to the last 6 to keep UI clean
  const visibleMessages = messages.slice(-6);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessage = input.trim();
    console.log('📤 Sending message:', userMessage);
    if (!userMessage || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text: userMessage }]
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            parts: m.parts
          })),
          contextCountry
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Got response:', data.text);

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        parts: [{ type: "text", text: data.text }]
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi không xác định";
      console.error('❌ Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="atlas-ai" className="atlas-surface rounded-lg p-4 sm:p-5" aria-labelledby="atlas-ai-title">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md border border-teal-300/40 bg-teal-400/15">
            <Bot className="h-5 w-5 text-teal-100" aria-hidden="true" />
          </span>
          <div>
            <h2 id="atlas-ai-title" className="text-lg font-semibold text-white">
              Atlas AI
            </h2>
            <p className="text-sm text-slate-400">Trợ lý phân tích hồ sơ quốc gia</p>
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-amber-200" aria-hidden="true" />
      </div>

      <div className={compact ? "mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1" : "mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1"}>
        {visibleMessages.map((message) => (
          <div
            key={message.id}
            className={message.role === "assistant" ? "rounded-lg border border-slate-700 bg-slate-950/55 p-3" : "rounded-lg border border-teal-400/30 bg-teal-400/10 p-3"}
          >
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">
              {message.parts ? message.parts.map((part: any, index: number) => {
                if (part.type === "text") return <span key={index}>{part.text}</span>;
                if (part.type === "tool-invocation") return (
                  <span key={index} className="block mt-2 text-xs italic text-teal-300/70">
                    Tra cứu công cụ: {part.toolInvocation.toolName}...
                  </span>
                );
                return null;
              }) : ""}
            </p>
          </div>
        ))}
        {isLoading && messages.length > 0 && (messages[messages.length - 1].role as string) === "user" ? (
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/55 p-3 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Atlas AI đang suy nghĩ...
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error.message || "Đã xảy ra lỗi khi kết nối với Atlas AI."}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Hỏi Atlas AI</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="atlas-input w-full rounded-md px-3 py-2"
            placeholder={contextCountry ? `Hỏi về ${contextCountry}...` : "Hỏi về Việt Nam, Hoa Kỳ, Trung Quốc..."}
          />
        </label>
        <button className="atlas-button focus-ring w-12 shrink-0" type="submit" aria-label="Gửi tin nhắn" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
    </section>
  );
}
