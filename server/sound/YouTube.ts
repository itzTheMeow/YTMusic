import sr from "youtube-sr";
import { constructVideoFromYouTube } from "../constructors";
import { Downloadable } from "../struct";

export async function searchYoutube(query: string): Promise<Downloadable[]> {
  try {
    const results = await sr.search(query, {
      type: "video",
    });
    return results.map(constructVideoFromYouTube);
  } catch {
    return [];
  }
}
