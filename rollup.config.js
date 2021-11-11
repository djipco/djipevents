// Imports
import license from "rollup-plugin-license";
import path from "path";
import { terser } from "rollup-plugin-terser";

// Source file and target directory
const sourceFile = "src/djipevents.js";
const targetDirectory = "dist";

// Options for license plugin
const licenseOptions = {
  banner: { content: { file: path.join(__dirname, "BANNER.txt") } },
  thirdParty: { allow: "(MIT OR Apache-2.0)" }
};

// Global scope namespace (djipevents) for browsers
const iife = {
  input: sourceFile,
  output: {
    format: "iife",
    file: path.join(targetDirectory, "iife/djipevents.iife.min.js"),
    exports: "named",
    name: "djipevents",
    sourcemap: true
  },
  plugins: [
    terser(),
    license(licenseOptions)
  ]
};

// ES6 module for modern browsers
const esm = {
  input: sourceFile,
  output: {
    format: "es",
    file: path.join(targetDirectory, "esm/djipevents.esm.min.js"),
    sourcemap: true
  },
  plugins: [
    terser(),
    license(licenseOptions)
  ]
};

// CommonJS export for Node.js
const cjs = {
  input: sourceFile,
  output: {
    format: "cjs",
    file: path.join(targetDirectory, "cjs/djipevents.cjs.min.js"),
    sourcemap: true
  },
  plugins: [
    terser(),
    license(licenseOptions)
  ]
};

// Pick the right one to export according to environment variable
let config = esm;

if (process.env.BABEL_ENV === "cjs") {
  config = cjs;
} else if (process.env.BABEL_ENV === "iife") {
  config = iife;
}

export default config;
