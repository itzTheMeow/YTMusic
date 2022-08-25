import { APIRouter, Media } from "../server";
import { MetadataProviders } from "../struct";

APIRouter.create(
  "artist_add",
  "POST",
  (req) => {
    const { id, source }: { id: string; source: MetadataProviders } = req.body;
    if (!id || !source || !(source in MetadataProviders))
      return { err: true, message: "Invalid ID or source." };

    Media.queueAction({ type: "ArtistAdd", id, provider: source });

    return { err: false };
  },
  true
);
