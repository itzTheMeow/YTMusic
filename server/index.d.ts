import { IAlias, IArea, IPeriod, IRelation, IRelease, IReleaseGroup } from "musicbrainz-api";

declare module "musicbrainz-api" {
  export interface IArtist {
    id: string;
    name: string;
    disambiguation: string;
    "sort-name": string;
    "type-id"?: string;
    "gender-id"?: any;
    "life-span"?: IPeriod;
    country?: string;
    ipis?: any[];
    isnis?: string[];
    aliases?: IAlias[];
    gender?: null;
    type?: string;
    area?: IArea;
    begin_area?: IArea;
    end_area?: IArea;
    relations?: IRelation[];
    /**
     * Only defined if 'releases' are includes
     */
    releases?: IRelease[];
    "release-groups"?: IReleaseGroup[];
  }
}
