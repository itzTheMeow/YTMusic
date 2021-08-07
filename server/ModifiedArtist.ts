interface ModifiedAlbum extends SpotifyApi.AlbumObjectSimplified {
  songs?: SpotifyApi.TrackObjectSimplified[];
}
interface ModifiedArtist extends SpotifyApi.SingleArtistResponse {
  albums?: ModifiedAlbum[];
}
export default ModifiedArtist;
