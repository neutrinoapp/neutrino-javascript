'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
//var mocha = require('gulp-mocha');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var exorcist = require('exorcist');
var watch = require('gulp-watch');
var tsify = require('tsify');
var watchify = require('watchify');

var main = './src/neutrino.ts';

var opts = {
    entries: [main],
    debug: true,
    standalone: 'Neutrino',
    cache: {},
    packageCache: {}
};

var b = browserify(opts)
    .plugin(watchify)
    .plugin(tsify, {
        target: 'es6'
    })
    .transform(babelify.configure({
        presets: ['babel-preset-es2015']
        //optional: ['runtime']
    }));

b.on('error', console.log);
b.on('update', build);

function build(done) {
    console.log('Building Neutrino....');
    b.bundle()
        .pipe(exorcist('./dist/neutrino.map'))
        .pipe(source(main))
        .pipe(rename('./neutrino.js'))
        .pipe(gulp.dest('./dist'));

    console.log('Done!');
}

gulp.task('build', build);

gulp.task('test', ['build'], function () {
    gulp.src('./test/neutrino-test.js')
        .pipe(mocha())
        .once('end', function () {
            process.exit();
        });
});