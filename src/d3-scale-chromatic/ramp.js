/// <reference lib="dom" />
import { interpolateRgbBasis } from "../d3-interpolate/mod.js";

export default (scheme) => interpolateRgbBasis(scheme[scheme.length - 1]);
