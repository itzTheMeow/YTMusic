import { variants } from "@catppuccin/palette";
import { writable } from "svelte/store";

export const Themes = [
  "dark",
  "light",
  "discord",
  "spotify",
  "plex",
  "aqua",
  "black",
  "dracula",
  "forest",
  "synthwave",
  ...Object.keys(variants),
];

export const localTheme = writable(localStorage.getItem("theme") || Themes[0]);
localTheme.subscribe((t) => {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
});
