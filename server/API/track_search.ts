import { APIRouter, Media } from "../server";
import { searchYoutube } from "../sound/YouTube";
import { SoundProviders } from "../struct";

APIRouter.create(
  "track_search",
  "POST",
  async (req) => {
    const { artist, album, track, provider } = req.body;
    if (!artist || !album || !track)
      return { err: true, message: "Invalid artist/album/track ID." };

    const foundArtist = Media.artists.find((a) => a.id == artist);
    if (!foundArtist) return { err: true, message: "Artist not found." };
    const foundAlbum = foundArtist.albums.find((a) => a.id == album);
    if (!foundAlbum) return { err: true, message: "Album not found." };
    const foundTrack = foundAlbum.tracks.find((t) => t.id == track);
    if (!foundTrack) return { err: true, message: "Track not found." };

    const searchTerm = `${foundArtist.name} - ${foundTrack.title}`;
    switch (provider as SoundProviders) {
      case SoundProviders.YouTube:
        return { err: false, list: await searchYoutube(searchTerm) };
      default:
        return { err: true, message: "Invalid sound provider." };
    }
  },
  true
);
