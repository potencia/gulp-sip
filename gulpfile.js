var gulp = require('gulp'),
istanbul = require('gulp-istanbul'),
jscs = require('gulp-jscs'),
jshint = require('gulp-jshint'),
mocha = require('gulp-mocha'),
gutil = require('gulp-util'),
sequence = require('run-sequence');

gulp.task('lint.run', function () {
    return gulp.src(['index.js', 'spec.js'])
    .pipe(jshint('jshint.json'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch.lint', function () {
    gulp.watch(['index.js', 'spec.js'], ['lint.run']);
});

gulp.task('lint', function (done) {
    if (gutil.env.watch) {
        sequence('lint.run', 'watch.lint', done);
    } else {
        sequence('lint.run', done);
    }
});

gulp.task('style.run', function (done) {
    gulp.src(['index.js', 'spec.js'])
    .pipe(jscs('jscs.json'))
    .on('error', function (error) {
        gutil.log(gutil.linefeed + error.message);
    })
    .on('finish', done);
});

gulp.task('watch.style', function () {
    gulp.watch(['index.js', 'spec.js'], ['style.run']);
});

gulp.task('style', function (done) {
    if (gutil.env.watch) {
        sequence('style.run', 'watch.style', done);
    } else {
        sequence('style.run', done);
    }
});

gulp.task('test.run', function (done) {
    function runTests() {
        gulp.src('spec.js')
        .pipe(mocha({reporter : gutil.env.reporter || 'dot'}))
        .on('error', function (error) {
            gutil.log(gutil.colors.red(error.message));
        })
        .pipe(gutil.env.coverage ? istanbul.writeReports('coverage') : gutil.noop())
        .on('finish', done);
    }
    if (gutil.env.coverage) {
        gulp.src('index.js')
        .pipe(istanbul())
        .on('finish', runTests);
    } else {
        runTests();
    }
});

gulp.task('watch.test', function () {
    gulp.watch(['index.js', 'spec.js'], ['test.run']);
});

gulp.task('test', function (done) {
    if (gutil.env.watch) {
        sequence('test.run', 'watch.test', done);
    } else {
        sequence('test.run', done);
    }
});

gulp.task('all', ['lint', 'style', 'test']);
