import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireUser(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req.headers.get("Authorization");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Response(JSON.stringify({ error: "Supabase environment is not configured" }), { status: 500 });
  }

  if (!authorization) {
    throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  return { client, user: data.user };
}
