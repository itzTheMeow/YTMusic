import useAutoprefixer from "autoprefixer";
import esbuild from "esbuild";
import postCssPlugin from "esbuild-style-plugin";
import esbuildSvelte from "esbuild-svelte";
import fs from "fs";
import sveltePreprocess from "svelte-preprocess";
import useTailwind from "tailwindcss";

console.log("Building client...");
esbuild
  .build({
    entryPoints: [`./src/index.ts`],
    bundle: true,
    outdir: `./dist`,
    mainFields: ["svelte", "browser", "module", "main"],
    minify: false,
    sourcemap: "inline",
    splitting: true,
    write: true,
    format: `esm`,
    watch: process.argv.includes(`--watch`),
    plugins: [
      esbuildSvelte({
        filterWarnings: (w) => !w.code.startsWith("a11y-"),
        preprocess: sveltePreprocess(),
      }),
      postCssPlugin({
        postcss: {
          plugins: [useTailwind, useAutoprefixer],
        },
      }),
    ],
    logLevel: "info",
    target: "es6",
    loader: { ".png": "file" },
  })
  .then(() => {
    fs.copyFileSync("src/index.html", "dist/index.html");
  })
  //@ts-ignore
  .catch((error, location) => {
    console.warn(`Errors: `, error, location);
    process.exit(1);
  });
