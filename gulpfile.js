'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');

gulp.task('hashpass', [], function () {
    return gulp.src(['manifest.json',
                     'index.html',
                     'bundle.js',
                     'js/*',
                     'img/*',
                     'css/*'],
                    {base: "."})
        .pipe(zip('hashpass.zip'))
        .pipe(gulp.dest('build/'));
});

gulp.task('build', [], function () {
  gulp.start('hashpass');
});

gulp.task('default', ['build'], function () {

});
