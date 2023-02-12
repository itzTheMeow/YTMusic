import { APIRouter, Media } from "../server";

APIRouter.create(
  "artist_get",
  "POST",
  (req) => {
    const artist = Media.artists.find((a) => a.id == req.body.id);
    if (!artist) return { err: true, message: "No artist found." };
    return { err: false, artist };
  },
  true
);
