import {
  ensureDirSync,
  ensureFileSync,
  existsSync,
  walkSync,
} from "https://deno.land/std@0.74.0/fs/mod.ts";

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

function fetchTypes(path: string, url: string) {
  fetch(url).then((res) => {
    if (res.status == 200) {
      res.text().then((text) => {
        ensureFileSync(path);
        text = text.replace(/^/, '/// <reference lib="dom" />\n')
        Deno.writeTextFileSync(path, text);
      });
    } else {
      console.log(`Got a ${res.status} from: ${url}`);
    }
  });
}

function identifyMissingFiles() {
  // walk through the dir looking for imports of .js files which don't exist in the dir
  const missedFiles: string[] = [];
  for (const entry of walkSync("d3")) {
    if (entry.isFile && entry.name.endsWith(".js")) {
      let src = Deno.readTextFileSync(entry.path);
      // match against .js imports
      const importMatches = src.matchAll(/import .+?\.js/gs); // maybe add regex 's' flag?
      for (const match of importMatches) {
        // try for down-one-dir first
        if (match[0].includes("../")) {
          console.log(`${entry.path} matched:\n${match[0]}`);
        } else if (match[0].includes("./")) {
          // construct the path using the match
          const x = match[0].split("./");
          const matchPath = x[x.length - 1];
          let relativePath = entry.path.split(entry.name)[0] + matchPath;
  
          // console.log(`${entry.path}, ${match[0]}`);

          // if file doesn't already exist, add it to the list
          if (!existsSync(relativePath)) {
            // clean up the path before adding it to the list
            relativePath = relativePath.slice(3);
            relativePath = relativePath.replaceAll("\\", "/");
            // we only want unique entries within the list
            if (!missedFiles.includes(relativePath)) {
              // console.log(`found import from: ${entry.path}\t\t\t${relativePath}`);
              missedFiles.push(relativePath);
            }
          }
        } else {
          console.log("WHAT?");
          console.log(`${entry.path} matched:\n${match[0]}`);
        }
      }
      // match against .js imports
      const exportMatches = src.matchAll(/export {.+?\.js/gs); // maybe add regex 's' flag?
      for (const match of exportMatches) {
        // construct the path using the match
        const x = match[0].split("./");
        const matchPath = x[x.length - 1];
        let relativePath = entry.path.split(entry.name)[0] + matchPath;

        // if file doesn't already exist, add it to the list
        if (!existsSync(relativePath)) {
          // clean up the path before adding it to the list
          relativePath = relativePath.slice(3);
          relativePath = relativePath.replaceAll("\\", "/");
          // we only want unique entries within the list
          if (!missedFiles.includes(relativePath)) {
            // console.log(`found export from: ${entry.path}\t\t\t${relativePath}`);
            missedFiles.push(relativePath);
          }
        }
      }
    }
  }
  return missedFiles;
}

function fetchFile(path:string) {
  // create the url
  const moduleName = path.split("/")[0];
  const relativePath = path.split(moduleName)[1];
  const srcURL =
    `https://raw.githubusercontent.com/d3/${moduleName}/master/src${relativePath}`;

  return fetch(srcURL)
  .then((res)=> {
    if (res.status == 200) {
      return res.text();
    } else {
      console.log(`Got a ${res.status} from: ${srcURL}`);
    } 
  })
  .then((text)=> {
    if (text) {
      // construct the path to write to.
      const splitPath = srcURL.split("src/");
      const relativePathJS = splitPath[splitPath.length - 1];

      const path = `${d3Dir}${moduleName}/`;

      ensureFileSync(path + relativePathJS);

      // add deno ref to dom
      text = text.replace(/^/, `/// <reference lib="dom" />\n`);

      Deno.writeTextFileSync(path + relativePathJS, text); 
      return true
    } else {
      return false
    }
  })
}

function adjustscriptURLS(path:string) {
  let src = Deno.readTextFileSync(path)

  src = src.replaceAll(/import .+? from ("|')d3-.+?("|')/g, (m) => {
    return changeImportURL(m);
  });
  // write the new urls to write
  Deno.writeTextFileSync(path, src);
}

function initIndex(moduleName: string) {
  const srcURL =
    `https://raw.githubusercontent.com/d3/${moduleName}/master/src/index.js`;
  const typesURL =
    `https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/${moduleName}/index.d.ts`;

  return fetch(srcURL)
    .then((res) => {
      if (res.status == 200) {
        return res.text();
      } else {
        console.log(`Got a ${res.status} from: ${srcURL}`);
      }
    })
    .then((text) => {
      if (text) {
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

        // add deno ref to types and dom
        text = text.replace(
          /^/,
          `/// <reference types="./${relativePathTS}" />\n/// <reference lib="dom" />\n`,
        );

        Deno.writeTextFileSync(path + relativePathJS, text);

        fetchTypes(path + relativePathTS, typesURL);
        return true;
      } else {
        return false;
      }
    });
}

function changeImportURL(match: string) {
  if (!match.includes("mod.js")) {
    if (match.includes("'")) {
      let newValue = match.replace(/'d3-/g, "'../d3-");
      newValue = newValue.replace(/'$/g, "/mod.js'");
      return newValue;
    } else {
      let newValue = match.replace(/"d3-/g, '"../d3-');
      newValue = newValue.replace(/"$/g, '/mod.js"');
      return newValue;
    }
  } else {
    return match;
  }
}

ensureDirSync(d3Dir);

if (!existsSync(`${d3Dir}mod.js`)) {
  for (let index = 0; index < d3modules.length; index++) {
    const moduleName = d3modules[index];
    await initIndex(moduleName);
  }
  // create the mod.js and mod.d.ts files
  let modSRC = '/// <reference types="./mod.d.ts" />\n/// <reference lib="dom" />\n';
  d3modules.forEach((name) => {
    modSRC += `export * from "./${name}/mod.js"\n`;
  });
  Deno.writeTextFileSync(`${d3Dir}mod.js`, modSRC);

  let modTypes = "";
  d3modules.forEach((name) => {
    modTypes += `export * from "./${name}/mod.d.ts"\n`;
  });
  Deno.writeTextFileSync(`${d3Dir}mod.d.ts`, modTypes);
}

let c = 1
let missing = identifyMissingFiles();

while (missing.length != 0) {
  // console.log(`round ${c}: ${missing.length} missing files`);
  // make a list of promises
  const files = []
  for (let index = 0; index < missing.length; index++) {
    const path = missing[index];
    files.push(fetchFile(path))
  }
  // wait for all the promises to resolve
  await Promise.all(files)
  c += 1
  missing = identifyMissingFiles()
}

// Once the loop finishes we can walk through the dir and update the d3 urls
// for (const entry of walkSync(d3Dir)) {
//   if (entry.isFile) {
//     adjustscriptURLS(entry.path)
//   }
// }

// TODO-DefinitelyMaybe: what about external libraries? i.e. geojson
// d3-geo and d3-contour need geojson urls
// geojson https://raw.githubusercontent.com/eugeneYWang/GeoJSON.ts/master/geojson.ts

// d3-delaunay\delaunay.js
// https://raw.githubusercontent.com/mapbox/delaunator/master/index.js url change
