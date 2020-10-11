import {
  ensureDirSync,
  ensureFileSync,
  existsSync,
  walkSync,
} from "https://deno.land/std@0.74.0/fs/mod.ts";

// step one. construct the urls
// step two. write all of the scripts and .d.ts files into one repo
// step three. update all of the urls
// step four. profit

const d3modules = [
  "d3-array",
  "d3-axis",
  "d3-brush",
  "d3-chord",
  "d3-color",
  "d3-contour",
  "d3-delaunay",
  "d3-dispatch",
  "d3-drag",
  "d3-dsv",
  "d3-ease",
  "d3-fetch",
  "d3-force",
  "d3-format",
  "d3-geo",
  "d3-hierarchy",
  "d3-interpolate",
  "d3-path",
  "d3-polygon",
  "d3-quadtree",
  "d3-random",
  "d3-scale",
  "d3-scale-chromatic",
  "d3-selection",
  "d3-shape",
  "d3-time",
  "d3-time-format",
  "d3-timer",
  "d3-transition",
  "d3-zoom",
];

const d3Dir = "d3/";

// https://raw.githubusercontent.com/d3/d3-array/master/src/index.js <- export { default as x } from "./local/relative/path"
// https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/d3-array/index.d.ts <- .d.ts file

async function fetchTypes(path: string, url: string) {
  fetch(url)
    .then((res) => {
      if (res.status == 200) {
        // get the text
        res.text()
          .then((text) => {
            ensureFileSync(path);

            Deno.writeTextFileSync(path, text);
          });
      } else {
        console.log(`Got a ${res.status} from: ${url}`);
      }
    });
}

async function populateFromSource(src: string, modName: string) {
  const matches = src.matchAll(/".+?js";/g);
  for (const match of matches) {
    let scriptRelativePath = match[0];

    // reshape the path
    scriptRelativePath = scriptRelativePath.replace(/"\.\//g, "");
    scriptRelativePath = scriptRelativePath.replace(/";/g, "");

    // construct the url
    const srcURL =
      `https://raw.githubusercontent.com/d3/${modName}/master/src/${scriptRelativePath}`;
    // and then fetch and write to file
    fetch(srcURL)
      .then((res) => {
        if (res.status == 200) {
          // get the text
          res.text()
            .then((text) => {
              // construct the path to write to.
              const path = `${d3Dir}${modName}/${scriptRelativePath}`;

              ensureFileSync(path);

              // add deno ref to types and dom
              text = text.replace(/^/, `/// <reference lib="dom" />\n`);
              text = text.replaceAll(/import .+? from "d3-.+?"/g, (m) => {
                return changeImportURL(m);
              });

              Deno.writeTextFileSync(path, text);
            });
        } else {
          console.log(`Got a ${res.status} from: ${srcURL}`);
          console.log(`match: ${match[0]}`);
          console.log(`relative path: ${scriptRelativePath}`);
        }
      });
  }
}

async function sortMissingFiles() {
  // also need to walk through all of d3 looking for imports of .js files which didn't get exported in the main index.js file
  const missedFiles: string[] = [];
  for (const entry of walkSync("d3")) {
    if (entry.isFile) {
      if (entry.name.endsWith(".js")) {
        // first sort out files which don't exist
        let src = Deno.readTextFileSync(entry.path);
        const matches = src.matchAll(/import .+\.js/g);
        for (const match of matches) {
          const x = match[0].split("./");
          const matchPath = x[x.length - 1];
          let relativePath = entry.path.split(entry.name)[0] + matchPath;
          // if file doesn't already exist, fetch it and write it to file
          if (!existsSync(relativePath)) {
            if (!relativePath.includes("mod.js")) {
              // clean up the path before adding it to the list
              relativePath = relativePath.slice(3);
              relativePath = relativePath.replaceAll("\\", "/");
              if (!missedFiles.includes(relativePath)) {
                missedFiles.push(relativePath);
              }
            }
          }
        }
        // then sort out incomplete import urls
        src = src.replaceAll(/import .+? from "d3-.+?"/g, (m) => {
          return changeImportURL(m);
        });
        // write the new urls to write
        Deno.writeTextFileSync(entry.path, src);
      }
    }
  }

  // then fetch all of the missing scripts
  missedFiles.forEach((path) => {
    // // create the url
    const moduleName = path.split("/")[0];
    const relativePath = path.split(moduleName)[1];
    const srcURL =
      `https://raw.githubusercontent.com/d3/${moduleName}/master/src${relativePath}`;

    fetch(srcURL)
      .then((res) => {
        if (res.status == 200) {
          // get the text
          res.text()
            .then((text) => {
              // construct the path to write to.
              const splitPath = srcURL.split("src/");
              const relativePathJS = splitPath[splitPath.length - 1].replace(
                /index\./g,
                "mod.",
              );

              const path = `${d3Dir}${moduleName}/`;

              ensureFileSync(path + relativePathJS);

              // add deno ref to dom
              text = text.replace(/^/, `/// <reference lib="dom" />\n`);

              Deno.writeTextFileSync(path + relativePathJS, text);
            });
        } else {
          console.log(`Got a ${res.status} from: ${srcURL}`);
        }
      });
  });
}

async function initIndices() {
  d3modules.forEach((moduleName) => {
    const srcURL =
      `https://raw.githubusercontent.com/d3/${moduleName}/master/src/index.js`;
    const typesURL =
      `https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/${moduleName}/index.d.ts`;

    fetch(srcURL)
      .then((res) => {
        if (res.status == 200) {
          // get the text
          res.text()
            .then((text) => {
              // construct the path to write to.
              const splitPath = srcURL.split("src/");
              const relativePathJS = splitPath[splitPath.length - 1].replace(
                /index\./g,
                "mod.",
              );
              // update the relative path for writing the .d.ts files
              const relativePathTS = relativePathJS.replace(/\.js/g, ".d.ts");
              const path = `${d3Dir}${moduleName}/`;

              // ensure that we can write the initial index/mod files
              ensureFileSync(path + relativePathJS);

              // gather the data needed to create more urls for all of the other scripts
              populateFromSource(text, moduleName);

              // add deno ref to types and dom
              text = text.replace(
                /^/,
                `/// <reference types="./${relativePathTS}" />\n/// <reference lib="dom" />\n`,
              );

              Deno.writeTextFileSync(path + relativePathJS, text);

              fetchTypes(path + relativePathTS, typesURL);
            });
        } else {
          console.log(`Got a ${res.status} from: ${srcURL}`);
        }
      });
  });
}

function changeImportURL(match: string) {
  if (!match.includes("mod.js")) {
    let newValue = match.replace(/"d3-/g, '"../d3-');
    newValue = newValue.replace(/"$/g, '/mod.js"');
    return newValue;
  } else {
    return match;
  }
}

ensureDirSync(d3Dir);

initIndices();

sortMissingFiles();

// create the mod.js and mod.d.ts files
let modSRC =
  '/// <reference types="./mod.d.ts" />\n/// <reference lib="dom" />\n';
d3modules.forEach((name) => {
  modSRC += `export * from "./${name}/mod.js"\n`;
});
Deno.writeTextFileSync(`${d3Dir}mod.js`, modSRC);

let modTypes = "";
d3modules.forEach((name) => {
  modTypes += `export * from "./${name}/mod.d.ts"\n`;
});
Deno.writeTextFileSync(`${d3Dir}mod.d.ts`, modTypes);

// TODO-DefinitelyMaybe: what about external libraries? i.e. geojson
