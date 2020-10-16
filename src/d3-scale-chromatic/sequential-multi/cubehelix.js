/// <reference lib="dom" />
import {cubehelix} from "../../d3-color/mod.js";
import {interpolateCubehelixLong} from "../../d3-interpolate/mod.js";

export default interpolateCubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));
