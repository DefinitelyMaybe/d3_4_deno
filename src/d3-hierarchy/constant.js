/// <reference lib="dom" />
export function constantZero() {
  return 0;
}

export default function(x) {
  return function() {
    return x;
  };
}
