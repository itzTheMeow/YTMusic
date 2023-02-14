import { API } from "index";

export default class {
  public authKey = localStorage.getItem("authToken") || "";
  constructor() {}
  public init() {
    if (this.isAuthorized)
      API.post("has_auth", {}).then((r) => {
        if (r.err) this.logout();
      });
  }

  public get isAuthorized() {
    return !!this.authKey;
  }
  public getAuthorized(token: string) {
    localStorage.setItem("authToken", token);
    window.location.href = "/";
  }
  public logout() {
    localStorage.removeItem("authToken");
    window.location.reload();
  }
}
