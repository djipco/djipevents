import babel from "rollup-plugin-babel";
const path = require("path");
const license = require("rollup-plugin-license");
import { terser } from "rollup-plugin-terser";

// Global scope namespace (djipevents) for browsers
const iife = {
  input: "src/djipevents.js",
  output: {
    format: "iife",
    file: "dist/iife/djipevents.iife.min.js",
    exports: "named",
    name: "djipevents",
    sourcemap: true
  },
  plugins: [
    babel(),
    terser(),
    license({
      banner: {
        content: {
          file: path.join(__dirname, "BANNER.txt")
        }
      },
      thirdParty: {
        allow: "(MIT OR Apache-2.0)",
      }
    })
  ]
};

// ES6 module for modern browsers
const esm = {
  input: "src/djipevents.js",
  output: {
    format: "es",
    file: "dist/esm/djipevents.esm.min.js",
    sourcemap: true
  },
  plugins: [
    terser(),
    license({
      banner: {
        content: {
          file: path.join(__dirname, "BANNER.txt")
        }
      },
      thirdParty: {
        allow: "(MIT OR Apache-2.0)",
      }
    })
  ]
};

// CommonJS export for Node.js
const cjs = {
  input: "src/djipevents.js",
  output: {
    format: "cjs",
    file: "dist/cjs/djipevents.cjs.min.js",
    sourcemap: true
  },
  plugins: [
    babel(),
    terser(),
    license({
      banner: {
        content: {
          file: path.join(__dirname, "BANNER.txt")
        }
      },
      thirdParty: {
        allow: "(MIT OR Apache-2.0)",
      }
    })
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
