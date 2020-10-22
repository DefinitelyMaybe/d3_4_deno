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
        // text = text.replace(/^/, '/// <reference lib="dom" />\n')
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
      const src = Deno.readTextFileSync(entry.path);
      // match against .js imports
      const importMatches = src.matchAll(/import .+?\.js/gs); // maybe add regex 's' flag?
      for (const match of importMatches) {
        // try for down-one-dir first
        if (match[0].includes("../")) {
          // construct the path using the match
          const x = match[0].split("../");
          const matchPath = x[x.length - 1];
          const splitPath = entry.path.split("\\")
          
          let relativePath = `${d3Dir}${splitPath[splitPath.length-3]}/${matchPath}`;
          
          // if file doesn't already exist, add it to the list
          if (!existsSync(relativePath)) {
            // clean up the path before adding it to the list
            relativePath = relativePath.slice(3);
            relativePath = relativePath.replaceAll("\\", "/");
            // we only want unique entries within the list
            if (!missedFiles.includes(relativePath)) {
              // console.log(`found import from: ${entry.path}\t\t\t${relativePath}`);
              // ignore mod.js urls on re-runs
              if (!relativePath.includes("mod.js")) {
                missedFiles.push(relativePath); 
              }
            }
          }

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
      // text = text.replace(/^/, `/// <reference lib="dom" />\n`);
      // maybe we'll add this back in soon but only for specific files?

      Deno.writeTextFileSync(path + relativePathJS, text); 
      return true
    } else {
      return false
    }
  })
}

function adjustscriptURLS(path:string) {
  let src = Deno.readTextFileSync(path)
  
  const scriptDepth = path.split("/").length;

  src = src.replaceAll(/import .+? from ("|')d3-.+?("|')/g, (m) => {
    if (!m.includes("mod.js")) {
      // split via different double or single quotes
      if (m.includes("'")) {
        let newValue = m.replace(/'d3-/g, `'${"../".repeat(scriptDepth-2)}d3-`);
        newValue = path.endsWith(".js") ?  newValue.replace(/'$/g, "/mod.js'") : newValue.replace(/'$/g, "/mod.d.ts'");
        return newValue;
      } else {
        let newValue = m.replace(/"d3-/g, `"${"../".repeat(scriptDepth-2)}d3-`);
        newValue = path.endsWith(".js") ? newValue.replace(/"$/g, '/mod.js"') : newValue.replace(/"$/g, '/mod.d.ts"');
        return newValue;
      }
    } else {
      return m;
    }
  });
  // single edge case for this multiline import
  src = src.replaceAll(/import {.+? from ("|')d3-.+?("|')/gs, (m)=> {
    // 4 needs to have depth of 2 i.e. ../../
    m = m.replace(/d3-/g, `../d3-`)
    m = m.replace(/"$/g, '/mod.js"')
    return m
  })
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
          `// @deno-types="./${relativePathTS}"\n`,
        );

        Deno.writeTextFileSync(path + relativePathJS, text);

        fetchTypes(path + relativePathTS, typesURL);
        return true;
      } else {
        return false;
      }
    });
}

ensureDirSync(d3Dir);

if (!existsSync(`${d3Dir}mod.js`)) {
  for (let index = 0; index < d3modules.length; index++) {
    const moduleName = d3modules[index];
    await initIndex(moduleName);
  }
  // create the mod.js and mod.d.ts files
  let modSRC = ''; // /// <reference lib="dom" />\n';
  d3modules.forEach((name) => {
    modSRC += `// @deno-types="./${name}/mod.d.ts"\nexport * from "./${name}/mod.js"\n`;
  });
  Deno.writeTextFileSync(`${d3Dir}mod.js`, modSRC);
}

let c = 1
let missing = identifyMissingFiles();

while (missing.length != 0) {
  console.log(`round ${c}: collecting ${missing.length} files`);
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
for (const entry of walkSync(d3Dir)) {
  if (entry.isFile) {
    // I like to replace the backslashes for working with strings
    adjustscriptURLS(entry.path.replaceAll(/\\/g, "/"))
  }
}

// lastly adjust specific files
const geoJsonURL = `https://raw.githubusercontent.com/caseycesari/GeoJSON.js/master/geojson.js`
const geoJsonTypesURL = `https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/geojson/index.d.ts`
const delaunayURL = `https://raw.githubusercontent.com/mapbox/delaunator/master/index.js`
const delaunayTypesURL = `https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/d3-delaunay/index.d.ts`
const d3geoFile = "d3/d3-geo/mod.d.ts"
const d3contourFile = "d3/d3-contour/mod.d.ts"
const delaunayFile = "d3/d3-delaunay/delaunay.js"

let src = Deno.readTextFileSync(d3geoFile)
src = src.replace(/import \* as GeoJSON from 'geojson';/g, (m)=> {
  m = m.replace(/'geojson'/g, `'${geoJsonURL}'`)
  m = m.replace(/^/g, `// @deno-types="${geoJsonTypesURL}"\n`)
  return m
})
Deno.writeTextFileSync(d3geoFile, src)

src = Deno.readTextFileSync(d3contourFile)
src = src.replace(/import { MultiPolygon } from 'geojson';/g, (m)=> {
  m = m.replace(/'geojson'/g, `'${geoJsonURL}'`)
  m = m.replace(/^/g, `// @deno-types="${geoJsonTypesURL}"\n`)
  return m
})
Deno.writeTextFileSync(d3contourFile, src)

src = Deno.readTextFileSync(delaunayFile)
src = src.replace(/import Delaunator from "delaunator";/g, (m)=> {
  m = m.replace(/"delaunator"/g, `"${delaunayURL}"`)
  m = m.replace(/^/g, `// @deno-types="${delaunayTypesURL}"\n`)
  return m
})
Deno.writeTextFileSync(delaunayFile, src)
