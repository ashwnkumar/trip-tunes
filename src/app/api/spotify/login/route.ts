import { envConfig } from "@/lib/envConfig";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const scopes = "";
  const redirectUri = envConfig.SPOTIFY_REDIRECT_URI;
  const clientId = envConfig.SPOTIFY_CLIENT_ID;
  const state = randomBytes(16).toString("hex");

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", clientId!);
  authUrl.searchParams.append("scope", scopes!);
  authUrl.searchParams.append("redirect_uri", redirectUri!);
  authUrl.searchParams.append("state", state);


  return NextResponse.redirect(authUrl.toString());
}
