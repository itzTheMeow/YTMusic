export default class {
  private authKey = localStorage.getItem("authToken") || "";
  constructor() {}

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
