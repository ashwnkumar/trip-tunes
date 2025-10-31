let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getSpotiftyAccessToken(): Promise<string | null> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // const res = await fetch("http://192.168.1.42:3000/api/spotify/token");
  // const res = await fetch("http://192.168.1.56:3000/api/spotify/token");
  const res = await fetch("http://192.168.1.56:4321/api/spotify/token");
  const data = await res.json();

  cachedToken = data.access_token;
  tokenExpiry = new Date(data.expires_at).getTime();

  return cachedToken;
}
