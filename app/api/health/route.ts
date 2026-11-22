import { CATALOG } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Uptime check endpoint. Reports configuration state, never secret values. */
export function GET() {
  return Response.json({
    status: "ok",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    catalogueSize: CATALOG.length,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    time: new Date().toISOString(),
  });
}
