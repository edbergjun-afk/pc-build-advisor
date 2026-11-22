"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import BuildPanel from "@/components/BuildPanel";
import { formatPHP } from "@/lib/format";
import type { BuildEvaluation, UseCase } from "@/lib/types";
import { MAX_BUDGET, MAX_USER_CHARS, MIN_BUDGET } from "@/lib/validation";

const USE_CASE_LABELS: Record<UseCase, string> = {
  gaming: "Gaming",
  "office-school": "Office / school",
  "video-editing": "Video editing",
  programming: "Programming",
  streaming: "Gaming + streaming",
  general: "General home use",
};

const STARTERS = [
  "Gaming PC for 1080p esports, budget PHP 40,000",
  "Quiet office PC for my small business, about PHP 25,000",
  "Video editing build for 4K YouTube, budget PHP 90,000",
];

function friendlyError(error: Error | undefined): string | null {
  if (!error) return null;
  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // not JSON
  }
  return error.message || "Something went wrong. Please try again.";
}

/** Renders **bold** safely (React escapes the text); the model sometimes uses it despite the prompt. */
function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4 ? (
      <strong key={i}>{chunk.slice(2, -2)}</strong>
    ) : (
      chunk
    ),
  );
}

function toolLabel(toolName: string, args: Record<string, unknown>, done: boolean): string {
  if (toolName === "searchParts") {
    const cap = typeof args.maxPrice === "number" ? ` under ${formatPHP(args.maxPrice)}` : "";
    return `${done ? "Searched" : "Searching"} ${String(args.category ?? "parts")}${cap}`;
  }
  if (toolName === "evaluateBuild") return done ? "Checked compatibility and budget" : "Checking compatibility...";
  return toolName;
}

export default function Advisor() {
  const { messages, input, handleInputChange, handleSubmit, append, status, error, stop, setMessages } = useChat({
    api: "/api/chat",
  });
  const [budget, setBudget] = useState("40000");
  const [useCase, setUseCase] = useState<UseCase>("gaming");
  const [formError, setFormError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";

  // The latest evaluateBuild tool result drives the build summary panel.
  const latestBuild = useMemo<BuildEvaluation | null>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const parts = messages[i].parts ?? [];
      for (let j = parts.length - 1; j >= 0; j--) {
        const part = parts[j];
        if (
          part.type === "tool-invocation" &&
          part.toolInvocation.toolName === "evaluateBuild" &&
          part.toolInvocation.state === "result"
        ) {
          return part.toolInvocation.result as BuildEvaluation;
        }
      }
    }
    return null;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function startFromForm(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(budget.replace(/[,\s]/g, ""));
    if (!Number.isInteger(value) || value < MIN_BUDGET || value > MAX_BUDGET) {
      setFormError(`Enter a whole-number budget between ${formatPHP(MIN_BUDGET)} and ${formatPHP(MAX_BUDGET)}.`);
      return;
    }
    setFormError(null);
    void append({
      role: "user",
      content: `My budget is ${formatPHP(value)} and I will mainly use the PC for ${USE_CASE_LABELS[useCase].toLowerCase()}. Please suggest a complete build.`,
    });
  }

  const errorText = friendlyError(error);

  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_380px]">
      <section className="flex min-h-[70vh] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={startFromForm} className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-4">
          <label className="flex flex-col text-xs font-medium text-slate-600">
            Budget (PHP)
            <input
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="mt-1 w-36 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
              aria-label="Budget in PHP"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-slate-600">
            Main use
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UseCase)}
              className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
            >
              {Object.entries(USE_CASE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Suggest a build
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              disabled={busy}
              className="ml-auto text-sm text-slate-500 underline-offset-2 hover:underline disabled:opacity-50"
            >
              Start over
            </button>
          )}
          {formError && <p className="w-full text-sm text-red-600">{formError}</p>}
        </form>

        <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
          {messages.length === 0 && (
            <div className="text-sm text-slate-600">
              <p className="mb-3">Use the form above, or ask in your own words. For example:</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void append({ role: "user", content: s })}
                    className="rounded-full border border-slate-300 px-3 py-1 text-left hover:bg-slate-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2 text-sm text-white"
                    : "max-w-[85%] space-y-2 text-sm"
                }
              >
                {(m.parts ?? []).map((part, idx) => {
                  if (part.type === "text") {
                    return (
                      <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                        {renderText(part.text)}
                      </p>
                    );
                  }
                  if (part.type === "tool-invocation") {
                    const inv = part.toolInvocation;
                    const done = inv.state === "result";
                    return (
                      <span
                        key={idx}
                        className="mr-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {done ? "✓ " : "… "}
                        {toolLabel(inv.toolName, (inv.args ?? {}) as Record<string, unknown>, done)}
                      </span>
                    );
                  }
                  return null;
                })}
                {m.role === "assistant" &&
                  !busy &&
                  !(m.parts ?? []).some((p) => p.type === "text" && p.text.trim()) &&
                  (m.parts ?? []).some(
                    (p) => p.type === "tool-invocation" && p.toolInvocation.toolName === "evaluateBuild",
                  ) && <p className="text-slate-600">Your checked build is shown in the build panel.</p>}
              </div>
            </div>
          ))}

          {status === "submitted" && <p className="text-sm text-slate-500">Thinking...</p>}
          {errorText && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorText}
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-4">
          <input
            value={input}
            onChange={handleInputChange}
            maxLength={MAX_USER_CHARS}
            placeholder="Ask a follow-up, e.g. 'make it quieter' or 'swap to an AMD graphics card'"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            aria-label="Message"
          />
          {busy ? (
            <button type="button" onClick={stop} className="rounded-md border border-slate-300 px-4 py-2 text-sm">
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Send
            </button>
          )}
        </form>
      </section>

      <BuildPanel build={latestBuild} />
    </div>
  );
}
