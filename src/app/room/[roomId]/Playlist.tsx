import InputComponent from "@/components/form/InputComponent";
import { Button } from "@/components/ui/button";
import { envConfig } from "@/lib/envConfig";
import { getSpotiftyAccessToken } from "@/lib/spotifyHelper";
import React, { useState } from "react";
import { toast } from "sonner";

function Playlist() {
  const [query, setQuery] = useState("blinding lights");
  const [result, setResult] = useState([]);

  const handleSearch = async () => {
    try {
      // const tokenRes = await fetch(
      //   "http://192.168.1.42:3000/api/spotify/refresh"
      // );
      // const { access_token } = await tokenRes.json();

      const token = await getSpotiftyAccessToken();

      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("~~~~~~~~~~data from spotify", data);
    } catch (error) {
      console.error("Error getting spotify results", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      Playlist
      <InputComponent
        id="query"
        name="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        label="Song"
      />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}

export default Playlist;
