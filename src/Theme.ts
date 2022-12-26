import { writable } from "svelte/store";

export const Themes = [
  "dark",
  "light",
  "aqua",
  "black",
  "dracula",
  "forest",
  "synthwave",
];

export const localTheme = writable(localStorage.getItem("theme") || Themes[0]);
localTheme.subscribe((t) => {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
});
