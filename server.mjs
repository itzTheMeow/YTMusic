import fs from "fs";
import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import express from "express";

const config = {
  port: 80,
};

const app = express();
/*if (!fs.existsSync("./dist/")) {
  fs.mkdirSync("./dist/");
}*/
console.log("Building...");
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
        preprocess: sveltePreprocess(),
      }),
    ],
  })
  .then(() => {
    fs.copyFileSync("src/index.html", "dist/index.html");
    console.log("Built successfully!");
    app.use(express.static(process.cwd() + "/dist"));
    app.listen(config.port, () => {
      console.log(`Listening on port ${config.port}.`);
    });
  })
  .catch((error, location) => {
    console.warn(`Errors: `, error, location);
    process.exit(1);
  });
