import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";

export default class SpotifyAuthManager {
  public api: SpotifyWebApi;

  constructor(private clientID: string, private secret: string) {
    this.api = new SpotifyWebApi({
      clientId: this.clientID,
      clientSecret: this.secret,
    });
    this.regenToken();
  }

  async generateToken() {
    const res = await axios
      .post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.clientID}:${this.secret}`).toString(
            "base64"
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .catch(console.error);
    if (!res) return "";
    const data = res.data;
    setTimeout(() => this.regenToken(), (data.expires_in as number) * 1000);
    return data.access_token as string;
  }

  async regenToken() {
    this.api.setAccessToken(await this.generateToken());
  }
}
