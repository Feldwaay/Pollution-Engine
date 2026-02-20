import { supabase } from "@/lib/db";

export async function GET() {
  const { data, error } = await supabase
    .from("pollution_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}