var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var exorcist = require('exorcist');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var ignore = require('gulp-ignore');
var sourcemaps = require('gulp-sourcemaps');
var reacttools = require('react-tools');
var fs = require('fs');

var reactifyES6 = function(file) {
    return reacttools.transform(fs.readFileSync(file), {
        sourceMap: true,
        harmony: true,
        sourceFilename: 'neutrino.map',
        stripTypes: true,
        es6module: true,
        target: 'es5'
    })
};

gulp.task('build', function () {
    var main = './src/neutrino.js';

    var bundler = browserify({
        entries: [main],
        debug: true,
        standalone: 'Neutrino',
        transform: [reactifyES6]
    });

    bundler.bundle()
        .on('error', console.log)
        .pipe(exorcist('./dist/neutrino.map'))
        .pipe(source(main))
        .pipe(rename('./neutrino.js'))
        .pipe(gulp.dest('./dist'));
});