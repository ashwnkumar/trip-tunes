import { envConfig } from "@/lib/envConfig";
import { NextResponse } from "next/server";

export async function GET() {
  const refreshToken = envConfig.SPOTIFY_REFRESH_TOKEN;
  const clientId = envConfig.SPOTIFY_CLIENT_ID;
  const clientSecret = envConfig.SPOTIFY_CLIENT_SECRET;

  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken!,
    });

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error refreshing Spotify token:", error);
    return NextResponse.json(
      { error: "Failed to refresh Spotify token: Internal Server Error" },
      { status: 500 }
    );
  }
}
