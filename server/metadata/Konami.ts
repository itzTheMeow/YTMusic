import axios from "axios";

let artistCache: {
  name: string;
  page: string;
}[] = [];

export async function searchKonamiArtists(query: string) {
  // This is all expected to exist, any errors will be caught by the parent try block.
  const linkList = artistCache.length
    ? artistCache
    : (artistCache = (
        await Promise.all(
          (
            (
              await axios.get(
                "https://remywiki.com/api.php?action=parse&page=Main_Page&format=json"
              )
            ).data.parse.links.map((l) => l["*"]) as string[]
          )
            .filter((c) => c.startsWith("Category:") && c.endsWith("Artists"))
            .map(async (c) =>
              (
                await axios.get(
                  `https://remywiki.com/api.php?action=query&list=categorymembers&cmtitle=${c}&format=json`
                )
              ).data.query.categorymembers.map((m) => ({
                name: String(m.title),
                page: String(m.pageid),
              }))
            )
        )
      ).flat(1));
  console.log(linkList, linkList.length);
}
