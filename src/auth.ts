export default class {
  private authKey = localStorage.getItem("authToken") || "";
  constructor() {}

  public get isAuthorized() {
    return !!this.authKey;
  }
}
