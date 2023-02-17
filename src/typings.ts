// Code generated by tygo. DO NOT EDIT.

//////////
// source: api.go

export interface APIErrorResponse {
  err: boolean;
  message?: string;
}
export interface APILoginRequest {
  username: string;
  password: string;
}
export interface APILoginResponse {
  token: string;
}
export interface APIPasswordChangeRequest {
  old: string;
  new: string;
}
export interface APISettingsSetRequest {
  key: string;
  value: string;
}
export interface APIArtistSearchRequest {
  query: string;
  provider: any /* types.MetadataProvider */;
}
export interface APIArtistGetRequest {
  id: string;
}
export interface APIArtistAddRequest {
  id: string;
  provider: any /* types.MetadataProvider */;
}
export interface APIArtistRemoveRequest {
  id: string;
}
export interface APITrackSearchRequest {
  query: string;
  provider: any /* types.SoundProvider */;
}
export interface APITrackAddRequest {
  artist: string;
  album: string;
  track: string;
  provider: any /* types.SoundProvider */;
  url: string;
}
export interface APITrackDeleteRequest {
  artist: string;
  album: string;
  track: string;
}
export interface WSPacket {
  type: string;
  data: string;
}
