'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
//var mocha = require('gulp-mocha');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var exorcist = require('exorcist');
var watch = require('gulp-watch');

var main = './src/neutrino.js';

var opts = {
    entries: [main],
    debug: true,
    standalone: 'Neutrino'
};

var b = browserify(opts)
    .transform(babelify.configure({
        presets: ['babel-preset-es2015']
        //optional: ['runtime']
    }));

var build = function (done) {
    console.log('Building Neutrino....');
    b.bundle()
        .on('error', console.log)
        .on('end', function () {
            console.log('Done');
            done || done();
        })
        .pipe(exorcist('./dist/neutrino.map'))
        .pipe(source(main))
        .pipe(rename('./neutrino.js'))
        .pipe(gulp.dest('./dist'));
};

gulp.task('build', build);

gulp.task('test', ['build'], function () {
    gulp.src('./test/neutrino-test.js')
        .pipe(mocha())
        .once('end', function () {
            process.exit();
        });
});