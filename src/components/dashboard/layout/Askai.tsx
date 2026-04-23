"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AskAIProps {
  /** Context hint shown in the input placeholder — e.g. the current course name */
  courseContext?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AskAI({
  courseContext,
  isOpen: controlledOpen,
  onOpenChange,
}: AskAIProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        courseContext
          ? `Hi! I'm Athenaeum AI. Ask me anything about ${courseContext}.`
          : "Hi! I'm Athenaeum AI. Ask me anything about your studies.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const response = await apiService.post<{ reply: string }>("/ai/chat", {
        message: text,
        context: courseContext,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const placeholder = courseContext
    ? `Type to ask the AI Tutor anything about ${courseContext}…`
    : "Ask the AI Tutor anything…";

  return (
    <>
      {/* ── Floating button ───────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f173e] hover:bg-[#1a2456] text-white text-sm font-semibold pl-4 pr-5 py-3 rounded-2xl shadow-[0_4px_20px_rgba(15,23,62,0.35)] hover:shadow-[0_6px_28px_rgba(15,23,62,0.45)] active:scale-[0.97] transition-all duration-200"
          aria-label="Open AI Tutor"
        >
          {/* Teal icon badge */}
          <span className="w-6 h-6 rounded-lg bg-green-400 flex items-center justify-center shrink-0">
            <Sparkles size={13} strokeWidth={2.2} className="text-[#0f173e]" />
          </span>
          Ask Athenaeum AI
        </button>
      )}

      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(15,23,62,0.22)] border border-gray-100 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f173e]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-green-400 flex items-center justify-center shrink-0">
                <Sparkles size={14} strokeWidth={2.2} className="text-[#0f173e]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  Athenaeum AI
                </p>
                <p className="text-[10px] text-green-300 leading-none">
                  {courseContext ? `Context: ${courseContext}` : "Ready to help"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close AI Tutor"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[380px] min-h-[200px] bg-[#f8f9fc]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Sparkles size={11} strokeWidth={2} className="text-green-600" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0f173e] text-white rounded-br-sm"
                      : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {isLoading && (
              <div className="flex justify-start">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <Sparkles size={11} strokeWidth={2} className="text-green-600" />
                </span>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white px-3 py-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none leading-relaxed max-h-[120px] min-h-[24px] py-0.5 disabled:opacity-50"
              aria-label="Message input"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-gray-300 hidden sm:block">
                HIT ENTER
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-lg bg-[#0f173e] hover:bg-[#1a2456] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all duration-150 active:scale-95"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                ) : (
                  <Send size={13} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}