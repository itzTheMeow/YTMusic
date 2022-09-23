import axios from "axios";
import { load } from "cheerio";
import { Duration } from "luxon";
import {
  Album,
  Artist,
  ExtendedArtist,
  MetadataProviders,
  MetadataProvidersList,
} from "../struct";

let artistCache: {
  name: string;
  page: string;
}[] = [];

export default async function getKonamiArtist(
  id: string
): Promise<ExtendedArtist> {
  const page = (
    await axios.get(
      `https://remywiki.com/api.php?action=parse&pageid=${id}&format=json`
    )
  ).data.parse;
  const artist = await constructArtistFromKonami(page);
  const $ = load(page.text["*"]);
  const songs = $("table tbody tr td:first-child a[href]:first-child")
    .get()
    .map((a) => $(a).attr("href").replace(/^\//, ""));

  return {
    ...artist,
    albums: (
      await Promise.all(
        songs.map(async (s) => {
          const d = (
            await axios.get(
              `https://remywiki.com/api.php?action=parse&page=${s}&format=json`
            )
          ).data?.parse;
          if (!d) return null;
          return await constructTrackAlbumFromKonami(d);
        })
      )
    ).filter((s) => s),
  };
}

export async function searchKonamiArtists(query: string) {
  // This is all expected to exist, any errors will be caught by the parent try block.
  const linkList: typeof artistCache = artistCache.length
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
                  `https://remywiki.com/api.php?action=query&list=categorymembers&cmtitle=${c}&cmlimit=500&format=json`
                )
              ).data.query.categorymembers.map((m) => ({
                name: String(m.title),
                page: String(m.pageid),
              }))
            )
        )
      ).flat(1));

  const found = [
    ...new Set(
      linkList
        .filter((l) => l.name.toLowerCase().includes(query.toLowerCase()))
        .map((l) => l.page)
    ),
  ].slice(0, 3);
  return await Promise.all(
    found.map(
      async (f) =>
        await constructArtistFromKonami(
          (
            await axios.get(
              `https://remywiki.com/api.php?action=parse&pageid=${f}&format=json`
            )
          ).data.parse
        )
    )
  );
}

async function findImage(name: string, retry = false) {
  const i = Object.values<any>(
    (
      await axios.get(
        `https://remywiki.com/api.php?action=query&titles=File:${name}&format=json&prop=imageinfo&iiprop=url`
      )
    ).data.query.pages
  )?.[0]?.imageinfo?.[0]?.url;
  return (
    i || (retry ? null : await findImage("Dance_Dance_Revolution.png", true))
  );
}

export async function constructArtistFromKonami(data: any): Promise<Artist> {
  return {
    id: String(data.pageid),
    name: data.title,
    url: `https://remywiki.com/${encodeURIComponent(data.title)}`,
    genres: [],
    followers: 0,
    icon: await findImage(data.images[0] || "Dance_Dance_Revolution.png"),
    providers: [MetadataProvidersList[MetadataProviders.Konami]],
  };
}
export async function constructTrackAlbumFromKonami(data: any): Promise<Album> {
  const duration =
    String(data.text["*"])
      .match(/Length:.*?(\d+:\d+)/)?.[1]
      ?.split(":")
      .reverse() || [];
  return {
    id: `alb${data.pageid}`,
    name: data.title,
    type: "single",
    url: `https://remywiki.com/${encodeURIComponent(data.title)}`,
    year:
      Number(data.text["*"].match(/, (\d\d\d\d)/)?.[1]) ||
      new Date().getFullYear(),
    image: await findImage(data.images[0] || "Dance_Dance_Revolution.png"),
    tracks: [
      {
        id: String(data.pageid),
        title: data.title,
        url: `https://remywiki.com/${encodeURIComponent(data.title)}`,
        number: 1,
        duration: Duration.fromObject({
          seconds: Number(duration[0]) || 0,
          minutes: Number(duration[1]) || 0,
          hours: Number(duration[2]) || 0,
        }).toMillis(),
        explicit: false,
      },
    ],
    provider: MetadataProvidersList[MetadataProviders.Konami],
  };
}
