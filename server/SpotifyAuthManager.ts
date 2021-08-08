import fetch from "node-fetch";
import SpotifyWebApi from "spotify-web-api-node";

class SpotifyAuthManager {
  private id: string;
  private secret: string;
  private spapi: SpotifyWebApi;

  constructor(id: string, secret: string, api: SpotifyWebApi) {
    this.id = id;
    this.secret = secret;
    this.spapi = api;
  }

  async generateToken() {
    let res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.id}:${this.secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).catch((err) => {
      throw err;
    });
    let data = (await res.json()) as any;
    let api = this.spapi;
    setTimeout(function () {
      api.resetRefreshToken();
    }, (data.expires_in as number) * 1000);

    return data.access_token as string;
  }
}
export default SpotifyAuthManager;
