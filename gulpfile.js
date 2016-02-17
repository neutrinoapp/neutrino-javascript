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

var main = './src/neutrino.ts';

var opts = {
    debug: true,
    standalone: 'Neutrino',
    cache: {},
    packageCache: {}
};

// walkSync('src').forEach(function(file) {
//     opts.entries.push('./src/' + file);
// });

var b = browserify(opts)
    .plugin(tsify, {
        target: 'es6'
    })
    .plugin(watchify)
    .transform(babelify.configure({
        presets: ['es2015', 'stage-0']
    }))
    .require('./src/neutrino.ts', { entry: true });

walkSync('typings').forEach(function(file) {
    if (file.match(/\.d\.ts$/)) {
        console.log('Adding typing: ' + file);
        b.add('typings/' + file);
    }
});

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