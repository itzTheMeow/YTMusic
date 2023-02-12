import SoundCloudTS from "soundcloud.ts";

export default class SoundCloudAuthManager {
  public api: SoundCloudTS;

  constructor() {
    this.api = new SoundCloudTS();
  }
}
