/**
 * Structured JSON logging. On Vercel these lines appear in the project's
 * Logs tab and can be filtered by "event". Never log message content,
 * API keys or IP addresses here.
 */
type Level = "info" | "warn" | "error";

export function log(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ level, event, ts: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
