import { envConfig } from "@/lib/envConfig";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No Code Provided" }, { status: 400 });
  }

  const { SPOTIFY_REDIRECT_URI, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } =
    envConfig;
  //   if (!SPOTIFY_REDIRECT_URI || !SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  //     return NextResponse.json(
  //       { error: "Missing Spotify environment variables" },
  //       { status: 500 }
  //     );
  //   }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI!,
    client_id: SPOTIFY_CLIENT_ID!,
    client_secret: SPOTIFY_CLIENT_SECRET!,
  });

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Spotify token error:", data);
      return NextResponse.json(
        { error: "Failed to fetch Spotify tokens", details: data },
        { status: response.status },
      );
    }

    // Save tokens to database
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    const { error: dbError } = await supabase.from("spotify_tokens").upsert({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt.toISOString(),
    });

    if (dbError) {
      console.error("Error saving tokens to database:", dbError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Spotify tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch Spotify tokens" },
      { status: 500 },
    );
  }
}
