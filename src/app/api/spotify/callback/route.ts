import { envConfig } from "@/lib/envConfig";
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

    console.log("response", response);

    if (!response.ok) {
      console.error("Spotify token error:", data);
      return NextResponse.json(
        { error: "Failed to fetch Spotify tokens", details: data },
        { status: response.status }
      );
    }

    console.log("SPOTIFY ACCESS_TOKEN:", data.access_token);
    console.log("SPOTIFY REFRESH_TOKEN:", data.refresh_token);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Spotify tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch Spotify tokens" },
      { status: 500 }
    );
  }
}
