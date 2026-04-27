import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRAVA_API = "https://www.strava.com/api/v3";

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("STRAVA_CLIENT_ID");
  const clientSecret = Deno.env.get("STRAVA_CLIENT_SECRET");
  const refreshToken = Deno.env.get("STRAVA_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Strava credentials");
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = await getAccessToken();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Athlete info
    const athleteRes = await fetch(`${STRAVA_API}/athlete`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!athleteRes.ok) throw new Error(`Athlete fetch failed: ${athleteRes.status}`);
    const athlete = await athleteRes.json();

    // 2. Athlete stats
    const statsRes = await fetch(`${STRAVA_API}/athletes/${athlete.id}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);
    const stats = await statsRes.json();

    // 3. Recent activities (last 30, paginated could be added)
    const actsRes = await fetch(`${STRAVA_API}/athlete/activities?per_page=30&page=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!actsRes.ok) throw new Error(`Activities fetch failed: ${actsRes.status}`);
    const activities = await actsRes.json();

    // Upsert summary
    await supabase.from("strava_summary").upsert({
      athlete_id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile_url: athlete.profile,
      city: athlete.city,
      country: athlete.country,
      recent_run_count: stats.recent_run_totals?.count ?? 0,
      recent_run_distance: stats.recent_run_totals?.distance ?? 0,
      recent_run_moving_time: stats.recent_run_totals?.moving_time ?? 0,
      recent_ride_count: stats.recent_ride_totals?.count ?? 0,
      recent_ride_distance: stats.recent_ride_totals?.distance ?? 0,
      recent_ride_moving_time: stats.recent_ride_totals?.moving_time ?? 0,
      ytd_run_count: stats.ytd_run_totals?.count ?? 0,
      ytd_run_distance: stats.ytd_run_totals?.distance ?? 0,
      ytd_run_moving_time: stats.ytd_run_totals?.moving_time ?? 0,
      ytd_ride_count: stats.ytd_ride_totals?.count ?? 0,
      ytd_ride_distance: stats.ytd_ride_totals?.distance ?? 0,
      ytd_ride_moving_time: stats.ytd_ride_totals?.moving_time ?? 0,
      all_run_count: stats.all_run_totals?.count ?? 0,
      all_run_distance: stats.all_run_totals?.distance ?? 0,
      all_ride_count: stats.all_ride_totals?.count ?? 0,
      all_ride_distance: stats.all_ride_totals?.distance ?? 0,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: "athlete_id" });

    // Upsert activities
    if (Array.isArray(activities) && activities.length > 0) {
      const rows = activities.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        sport_type: a.sport_type,
        distance: a.distance,
        moving_time: a.moving_time,
        elapsed_time: a.elapsed_time,
        total_elevation_gain: a.total_elevation_gain,
        average_speed: a.average_speed,
        max_speed: a.max_speed,
        average_heartrate: a.average_heartrate,
        max_heartrate: a.max_heartrate,
        start_date: a.start_date,
        start_date_local: a.start_date_local,
        timezone: a.timezone,
        location_city: a.location_city,
        location_country: a.location_country,
        kudos_count: a.kudos_count ?? 0,
        achievement_count: a.achievement_count ?? 0,
      }));
      await supabase.from("strava_activities").upsert(rows, { onConflict: "id" });
    }

    return new Response(
      JSON.stringify({ success: true, synced_activities: activities.length, athlete_id: athlete.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("strava-sync error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
