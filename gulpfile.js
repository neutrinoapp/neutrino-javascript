var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var exorcist = require('exorcist');
var reactify = require('reactify');

var reactifyES6 = function(file) {
    return reactify(file, {
        'harmony': true,
        'strip-types': true
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
        .pipe(exorcist('./dist/neutrino.js.map'))
        .pipe(source(main))
        .pipe(rename('./neutrino.js'))
        .pipe(gulp.dest('./dist'));
});