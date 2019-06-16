const gulp = require("gulp");
const eslint = require("gulp-eslint");
const ghPages = require("gulp-gh-pages");
const jsdoc = require("gulp-jsdoc3");
const spawn = require("child_process").spawn;

function generateDoc(cb) {

  let config = require("./.jsdoc.json");

  return gulp
    .src(["README.md", "./src/**/*.js"], {read: false})
    .pipe(jsdoc(config, cb));

}

function publishDoc() {
  return gulp.src("./docs/**/*")
    .pipe(ghPages());
}

function lint() {
  return gulp.src(["src/*.js"])
    .pipe(eslint())
    .pipe(eslint.failAfterError());
}

function releaseToNpm(cb) {
  spawn("npm", ["publish"], { stdio: "inherit" }).on("close", cb);
}

const doc = gulp.series(generateDoc, publishDoc);

exports.lint = lint;
exports.doc = doc;
exports.release = releaseToNpm;
