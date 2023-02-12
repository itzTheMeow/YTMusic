import { APIRouter, Media } from "../server";

APIRouter.create(
  "track_remove",
  "POST",
  (req) => {
    const { artist, album, track } = Media.getTrack(
      req.body.artist,
      req.body.album,
      req.body.track
    );
    if (!track) return { err: true, message: "Invalid track ID." };
    Media.queueAction({ type: "SongDelete", artist, album, track });
  },
  true
);
