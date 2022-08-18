/// <reference path="index.d.ts"/>

import auth from "auth";
import App from "./index.svelte";
import LoginPage from "./LoginPage.svelte";
import "./style.css";

export const Auth = new auth();
export const config = {
  brandName: "YTMusic",
};

if (window.location.pathname == "/login")
  new LoginPage({ target: document.body });
else new App({ target: document.body });
