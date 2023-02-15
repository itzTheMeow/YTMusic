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
export interface APITrackSearchRequest {
  query: string;
  provider: any /* types.SoundProvider */;
}
