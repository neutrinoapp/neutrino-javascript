'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
// var mocha = require('gulp-mocha');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var exorcist = require('exorcist');
var watch = require('gulp-watch');
var tsify = require('tsify');
var watchify = require('watchify');
var walkSync = require('walk-sync');
var path = require('path');
var mocha = require('gulp-mocha');

var main = './src/neutrino.ts';
var typingsCache = {};

var opts = {
    entries: [main],
    debug: true,
    cache: {},
    packageCache: {}
};

var b = browserify(opts)
    .plugin(tsify, {
        target: 'es6',
        module: 'system',
        sourcemap: true
    })
    .plugin(watchify)
    .transform(babelify, {
        presets: ['es2015', 'stage-0'],
        extensions: ['.ts']
    });

b.on('update', build);

function build(done) {
    console.log('Adding typings.....');

    walkSync('typings').forEach(function(file) {
        if (file.match(/\.d\.ts$/) && !typingsCache.hasOwnProperty(file)) {
            console.log('Adding typing: ' + file);
            b.add('typings/' + file);
            typingsCache[file] = true;
        }
    });

    console.log('Building Neutrino....');
    b.bundle()
        .on('error', console.log)
        .on('end', () => {
            console.log('Done!');
        })
        .on('missing-map', () => {
            console.log('Missing map!');
        })
        .pipe(exorcist(path.join(__dirname, 'dist', 'neutrino.js.map'), null, path.join(__dirname, 'src')))
        .pipe(source(main))
        .pipe(rename('./neutrino.js'))
        .pipe(gulp.dest('./dist'));
}

gulp.task('build', build);

gulp.task('test', () => {
    return gulp.src('./test/test.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});