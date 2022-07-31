type MediaTags = {
  artist: string;
  album: string;
  title: string;
  track: string;
  disc?: string;
  label?: any;
  date: number;
};

type MediaOptions = {
  attachments?: string[];
  id3v1?: boolean;
  "id3v2.3"?: boolean;
};

export { MediaTags, MediaOptions };
