import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

// Global scope namespace (djipevents) for browsers
const iife = {
  input: "src/djipevents.js",
  output: {
    format: "iife",
    file: "dist/djipevents.iife.min.js",
    exports: "named",
    name: "djipevents"
  },
  plugins: [
    babel(),
    terser()
  ]
};

// ES6 module for modern browsers
const esm = {
  input: "src/djipevents.js",
  output: {
    format: "es",
    file: "dist/djipevents.esm.min.js"
  },
  plugins: [
    terser()
  ]
};

// CommonJS export for Node.js
const cjs = {
  input: "src/djipevents.js",
  output: {
    format: "es",
    file: "dist/djipevents.cjs.min.js"
  },
  plugins: [
    babel(),
    terser()
  ]
};

// Pick the right one to export according to environment variable
let config;

if (process.env.BABEL_ENV === "cjs") {
  config = cjs;
} else if (process.env.BABEL_ENV === "iife") {
  config = iife;
} else {
  config = esm;
}

export default config;
