import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";

const DEDUP_WINDOW_MS = 3 * 60 * 1000;

function isRecent(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < DEDUP_WINDOW_MS;
}

function normalize(value: unknown): string {
  return String(value ?? "").toLowerCase().trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { client, user } = await requireUser(req);
    const { type, payload } = await req.json();

    if (!payload || typeof payload !== "object") {
      return jsonResponse({ error: "Payload is required" }, 400);
    }

    const input = payload as Record<string, unknown>;

    if (type === "skills_scan") {
      const { data: last, error: lastError } = await client
        .from("skills_scans")
        .select("target_role, match_percentage, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) throw lastError;

      if (
        last &&
        isRecent(last.created_at) &&
        normalize(last.target_role) === normalize(input.target_role) &&
        last.match_percentage === input.match_percentage
      ) {
        return jsonResponse({ saved: false, reason: "Duplicate result - same role and score saved recently." });
      }

      const { error } = await client.from("skills_scans").insert({
        user_id: user.id,
        target_role: input.target_role,
        match_percentage: input.match_percentage,
        skills_data: input.skills_data,
      });

      if (error) throw error;
      return jsonResponse({ saved: true });
    }

    if (type === "resume_score") {
      const { data: last, error: lastError } = await client
        .from("resume_scores")
        .select("overall_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) throw lastError;

      if (last && isRecent(last.created_at) && last.overall_score === input.overall_score) {
        return jsonResponse({ saved: false, reason: "Duplicate result - same resume score saved recently." });
      }

      const { error } = await client.from("resume_scores").insert({
        user_id: user.id,
        overall_score: input.overall_score,
        result_data: input.result_data,
      });

      if (error) throw error;
      return jsonResponse({ saved: true });
    }

    if (type === "interview_session") {
      const { data: last, error: lastError } = await client
        .from("interview_sessions")
        .select("role, score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) throw lastError;

      if (
        last &&
        isRecent(last.created_at) &&
        normalize(last.role) === normalize(input.role) &&
        last.score === input.score
      ) {
        return jsonResponse({ saved: false, reason: "Duplicate result - same interview score saved recently." });
      }

      const { error } = await client.from("interview_sessions").insert({
        user_id: user.id,
        role: input.role,
        score: input.score,
        questions_count: input.questions_count,
      });

      if (error) throw error;
      return jsonResponse({ saved: true });
    }

    return jsonResponse({ error: "Unknown activity type" }, 400);
  } catch (error) {
    if (error instanceof Response) {
      return new Response(error.body, {
        status: error.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return jsonResponse({ error: "Save failed" }, 500);
  }
});
