"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { api } from "@/utils/api";
import { friendlyError } from "@/utils/photo";

const STARTERS = [
  "What haircut suits me?",
  "How do I start a simple skin routine?",
  "What should I wear to an interview?",
  "How do I keep a beard neat?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, waiting]);

  async function send(content) {
    const question = content.trim();
    if (!question || waiting) return;

    const next = [...messages, { role: "user", content: question }];
    setMessages(next);
    setText("");
    setError("");
    setWaiting(true);

    // The server accepts the last 12 messages, and the first one must be from the person
    let recent = next.slice(-12);
    while (recent.length > 1 && recent[0].role !== "user") recent = recent.slice(1);

    try {
      const data = await api.post("/api/assistant/chat", { messages: recent });
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(friendlyError(err, "Something went wrong. Please try again."));
    } finally {
      setWaiting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    send(text);
  }

  return (
    <>
      <title>Style assistant | StyleScan AI</title>
      <AppShell
        title="Style assistant"
        description="Ask about haircuts, beards, glasses, clothes, grooming or skin care. Answers use your own results."
      >
        <div className="flex h-[60vh] min-h-[380px] flex-col rounded-xl border border-line bg-surface">
          <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
            {messages.length === 0 && (
              <div>
                <p className="text-muted">Hi! Ask me anything about your look. Here are some ideas:</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => send(starter)}
                      className="rounded-full border border-line px-3 py-1.5 text-sm transition-colors hover:border-ink hover:bg-tape/20"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    message.role === "user" ? "bg-ink text-white" : "bg-paper"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {waiting && (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-muted">Thinking...</p>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {error && <Alert className="mx-5 mb-3">{error}</Alert>}

          <form onSubmit={handleSubmit} className="flex gap-3 border-t border-line p-4">
            <label htmlFor="message" className="sr-only">
              Your question
            </label>
            <input
              id="message"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={1000}
              placeholder="Type your question"
              className="h-11 min-w-0 flex-1 rounded-full border border-line bg-paper px-5 text-[15px] focus:border-ink focus:outline-none focus:ring-4 focus:ring-tape/50"
            />
            <Button type="submit" disabled={waiting || !text.trim()} aria-label="Send">
              <SendHorizontal className="size-4" aria-hidden="true" />
              Send
            </Button>
          </form>
        </div>
        <p className="mt-4 text-sm text-muted">
          The assistant is an AI and can make mistakes. It is not a doctor. For a painful or worrying skin problem,
          please see a doctor.
        </p>
      </AppShell>
    </>
  );
}