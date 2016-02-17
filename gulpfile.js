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
        target: 'es6',
        sourceType: 'module'
    })
    .transform(babelify.configure({
        presets: ['es2015', 'stage-0'],
        extensions: ['es6']
        //optional: ['runtime']
    }));

b.on('update', build);

function build(done) {
    console.log('Building Neutrino....');
    b.bundle()
        .on('error', console.log)
        .on('end', () => {
            console.log('Done!');
        })
        .pipe(exorcist('./dist/neutrino.map'))
        .pipe(source(main))
        .pipe(rename('./neutrino.js'))
        .pipe(gulp.dest('./dist'));
}

gulp.task('build', build);

gulp.task('test', ['build'], function () {
    gulp.src('./test/neutrino-test.js')
        .pipe(mocha())
        .once('end', function () {
            process.exit();
        });
});