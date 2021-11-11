const gulp = require("gulp");
const ghPages = require("gulp-gh-pages");
const jsdoc = require("gulp-jsdoc3");
const spawn = require("child_process").spawn;

function generateDoc(cb) {

  let config = require("./.jsdoc.json");

  return gulp
    .src(["README.md", "./src/*.js"], {read: false})
    .pipe(jsdoc(config, cb));

}

function publishDoc() {
  return gulp.src("./docs/**/*")
    .pipe(ghPages());
}

function releaseToNpm(cb) {
  spawn("npm", ["publish"], { stdio: "inherit" }).on("close", cb);
}

const doc = gulp.series(generateDoc, publishDoc);

exports.doc = doc;
exports.release = releaseToNpm;
