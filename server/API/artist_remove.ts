import { APIRouter, Media } from "../server";

APIRouter.create(
  "artist_remove",
  "POST",
  (req) => {
    const artist = Media.artists.find((a) => a.id == req.body.id);
    if (!artist) return { err: true, message: "No artist found." };
    Media.queueAction({ type: "ArtistDelete", id: artist.id });
    return { err: false };
  },
  true
);
