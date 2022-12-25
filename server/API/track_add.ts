import { APIRouter, Media } from "../server";
import { SoundProviders } from "../struct";

APIRouter.create(
  "track_add",
  "POST",
  (req) => {
    const { artist, album, track, provider, url } = req.body;
    if (!artist || !album || !track)
      return { err: true, message: "Invalid artist/album/track ID." };

    const foundArtist = Media.artists.find((a) => a.id == artist);
    if (!foundArtist) return { err: true, message: "Artist not found." };
    const foundAlbum = foundArtist.albums.find((a) => a.id == album);
    if (!foundAlbum) return { err: true, message: "Album not found." };
    const foundTrack = foundAlbum.tracks.find((t) => t.id == track);
    if (!foundTrack) return { err: true, message: "Track not found." };

    if (!Object.values(SoundProviders).includes(provider))
      return { err: true, message: "Invalid sound provider." };

    Media.queueAction({
      type: "SongDownload",
      artist: foundArtist,
      album: foundAlbum,
      track: foundTrack,
      provider,
      url,
    });
    return { err: false };
  },
  true
);
