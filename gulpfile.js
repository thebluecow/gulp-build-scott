'use strict';

const gulp  = require('gulp'),
    uglify  = require('gulp-uglify'),
    concat  = require('gulp-concat'),
      sass  = require('gulp-sass'),
  imagemin  = require('gulp-imagemin'),
    rename  = require('gulp-rename'),
      maps  = require('gulp-sourcemaps'),
runSequence = require('run-sequence'),
    connect = require('gulp-connect'),
     eslint = require('gulp-eslint'),
       del  = require('del');

// http://justinchmura.com/2016/06/28/eslint-using-gulp/
// using ESLint to lint code and provide feedback on issues
// see .eslintrc for rule configuration
gulp.task('lint', function () {
  return gulp.src('js/circle/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// concatenate all of the project’s JavaScript files into global.js
// Additionally create source maps
gulp.task('concat', ['lint'], function() {
  return gulp.src('js/circle/*.js')
             .pipe(maps.init())
             .pipe(concat('global.js'))
             .pipe(maps.write('./'))
             .pipe(gulp.dest('js'));
});

// minify and copy global.js into all.min.js and copy to dist/scripts
gulp.task('scripts', ['concat'], function() {
  return gulp.src('js/global.js')
             .pipe(uglify())
             .pipe(rename('app.min.js'))
             .pipe(gulp.dest('dist/scripts'));
});

// compile and concatenate the project’s SCSS files into CSS.
// Additionally create source maps
gulp.task('sass', function() {
  return gulp.src("sass/global.scss")
      .pipe(maps.init())
      .pipe(sass())
      .pipe(maps.write('./'))
      .pipe(gulp.dest('css'));
});

// minify and copy to all.min.css and then copy to the dist/styles folder
gulp.task('styles', ['sass'], function() {
  return gulp.src("sass/global.scss")
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(rename('all.min.css'))
      .pipe(gulp.dest('dist/styles'));
});

// optimize the size of the project’s JPEG and PNG files and copy to the dist/content folder
gulp.task('images', function () {
  gulp.src('images/*')
    .pipe(imagemin([
          imagemin.jpegtran({progressive: true}),
          imagemin.optipng({optimizationLevel: 5})],
          { verbose: true }))
    .pipe(gulp.dest('dist/content'));
});

// copy icons directory and index.html to /dist
gulp.task('copy', function() {
  gulp.src('./*.html')
      .pipe(gulp.dest('dist'));
  gulp.src('icons/**/*')
      .pipe(gulp.dest('dist/icons'));
});

// watch for changes to sass files and then recompile sass and reload
gulp.task('watch', function() {
  gulp.watch('sass/**/*.{scss,sass}', function(){ runSequence('styles', 'html') });
  //gulp.watch('js/circle/*.js', function(){ runSequence('scripts', 'html') });
});

// delete all files from the /dist directory
gulp.task('clean', function() {
  del(['dist/**', '!dist']);
});

// first clean, then rebuild project completely
gulp.task('build', function(callback) {
  runSequence('clean', ['scripts', 'styles', 'images', 'copy'], callback);
});

// create a http server to serve project content
gulp.task('connect', function() {
  connect.server({
    root: './',
    port: 3000,
    livereload: true
  });
});

// reload project
gulp.task('html', function () {
  gulp.src('./index.html')
    .pipe(connect.reload());
});

// default project. Run gulp at command line to build project, start http server,
// and begin watching for sass changes
gulp.task("default", function() {
  runSequence('build', 'connect', 'watch');
});
