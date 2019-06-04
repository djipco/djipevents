const gulp = require("gulp");
const concat = require("gulp-concat");
const eslint = require("gulp-eslint");
const ghPages = require("gulp-gh-pages");
const jsdoc = require("gulp-jsdoc3");
const minify = require("gulp-minify");
const release = require("gulp-package-release").release;
const pkg = require("./package.json");

function bundle() {

  return gulp.src(["./src/*.js"])                       // fetch source files
    .pipe(concat("djipevents.js"))                     // concatenate them
    .pipe(minify({ext: { min:".min.js" } } ))      // minify
    .pipe(gulp.dest("./dist"));                         // write to disk

}

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

function releaseToNpm() {
  // return release();
  return release({
    version: pkg.version,
    tag: "v" + pkg.version,
    nextVersion: "1.0.2-SNAPSHOT"
  });
}

const doc = gulp.series(generateDoc, publishDoc);
const build = gulp.series(lint, bundle, generateDoc, publishDoc);

exports.lint = lint;
exports.doc = doc;
exports.build = build;
exports.release = releaseToNpm;
