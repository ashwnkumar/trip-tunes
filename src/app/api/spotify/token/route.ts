import { envConfig } from "@/lib/envConfig";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("spotify_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // If no token in database, use env variable as fallback
  if (error && error.code === "PGRST116") {
    const refreshToken = envConfig.SPOTIFY_REFRESH_TOKEN;

    if (!refreshToken) {
      return NextResponse.json(
        {
          error:
            "No Spotify tokens found. Please authenticate via /api/spotify/login",
        },
        { status: 401 },
      );
    }

    // Get new access token using refresh token from env
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${envConfig.SPOTIFY_CLIENT_ID}:${envConfig.SPOTIFY_CLIENT_SECRET}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const tokenData = await response.json();

    if (!tokenData.access_token) {
      console.error("Error refreshing token from env:", tokenData);
      return NextResponse.json(
        { error: "Spotify token refresh failed" },
        { status: 500 },
      );
    }

    const newExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

    // Save to database for future use
    await supabase.from("spotify_tokens").insert({
      access_token: tokenData.access_token,
      refresh_token: refreshToken,
      expires_at: newExpiry.toISOString(),
    });

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_at: newExpiry.toISOString(),
      cached: false,
    });
  }

  if (error) {
    console.error("Error fetching token:", error);
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 500 },
    );
  }

  const { access_token, refresh_token, expires_at } = data;
  const isExpired = new Date(expires_at).getTime() < Date.now();

  if (!isExpired) {
    return NextResponse.json({ access_token, expires_at, cached: true });
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${envConfig.SPOTIFY_CLIENT_ID}:${envConfig.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  const tokenData = await response.json();

  if (!tokenData.access_token) {
    console.error("Error refreshing token:", tokenData);
    return NextResponse.json(
      { error: "Spotify token refresh failed" },
      { status: 500 },
    );
  }

  const newExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

  await supabase.from("spotify_tokens").upsert({
    id: data.id,
    access_token: tokenData.access_token,
    refresh_token: refresh_token,
    expires_at: newExpiry.toISOString(),
  });

  return NextResponse.json({
    access_token: tokenData.access_token,
    expires_at: newExpiry.toISOString(),
    cached: false,
  });
}
