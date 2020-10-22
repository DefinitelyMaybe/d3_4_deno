/// <reference lib="dom" />
// @deno-types="./mod.d.ts"
export { linear as easeLinear } from "./linear.js";

export {
  quadIn as easeQuadIn,
  quadInOut as easeQuad,
  quadInOut as easeQuadInOut,
  quadOut as easeQuadOut,
} from "./quad.js";

export {
  cubicIn as easeCubicIn,
  cubicInOut as easeCubic,
  cubicInOut as easeCubicInOut,
  cubicOut as easeCubicOut,
} from "./cubic.js";

export {
  polyIn as easePolyIn,
  polyInOut as easePoly,
  polyInOut as easePolyInOut,
  polyOut as easePolyOut,
} from "./poly.js";

export {
  sinIn as easeSinIn,
  sinInOut as easeSin,
  sinInOut as easeSinInOut,
  sinOut as easeSinOut,
} from "./sin.js";

export {
  expIn as easeExpIn,
  expInOut as easeExp,
  expInOut as easeExpInOut,
  expOut as easeExpOut,
} from "./exp.js";

export {
  circleIn as easeCircleIn,
  circleInOut as easeCircle,
  circleInOut as easeCircleInOut,
  circleOut as easeCircleOut,
} from "./circle.js";

export {
  bounceIn as easeBounceIn,
  bounceInOut as easeBounceInOut,
  bounceOut as easeBounce,
  bounceOut as easeBounceOut,
} from "./bounce.js";

export {
  backIn as easeBackIn,
  backInOut as easeBack,
  backInOut as easeBackInOut,
  backOut as easeBackOut,
} from "./back.js";

export {
  elasticIn as easeElasticIn,
  elasticInOut as easeElasticInOut,
  elasticOut as easeElastic,
  elasticOut as easeElasticOut,
} from "./elastic.js";
