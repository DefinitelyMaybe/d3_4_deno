# d3_4_deno
A simple transformation of d3 for use within a deno workflow

[Manage your external dependencies with care.](https://deno.land/manual/examples/manage_dependencies)

The main.ts script finally works by itself if you'd like to further customize the repo. You're also welcome to create an issue or PR should the need arise :)

note:
maybe change 
`// @deno-types="./${name}/mod.d.ts"`
to 
`/// <reference types="" />`
within the src/mod.js script. there is currently an error when importing
import * as d3 from `https://deno.land/x/d3_4_deno@v6.2.0.1/src/mod.js`
directly... the direct to module code works just fine tho, i.e.
import * as d3array from `https://deno.land/x/d3_4_deno@v6.2.0.1/src/d3-array/mod.js`