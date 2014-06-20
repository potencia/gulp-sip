var gulp = require('gulp'),
istanbul = require('gulp-istanbul'),
jscs = require('gulp-jscs'),
jshint = require('gulp-jshint'),
mocha = require('gulp-mocha'),
gutil = require('gulp-util'),
sequence = require('run-sequence');

var js = {
    all : ['index.js', 'lib/gulp-sip.js', 'lib/task.js', 'lib/util.js', 'test/gulp-sip-spec.js', 'test/task-spec.js', 'test/util-spec.js'],
    main : ['index.js', 'lib/gulp-sip.js', 'lib/task.js', 'lib/util.js'],
    test : ['test/gulp-sip-spec.js', 'test/task-spec.js', 'test/util-spec.js']
};

gulp.task('lint.main', function () {
    return gulp.src(js.main)
    .pipe(jshint('build/jshint.main.json'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint.test', function () {
    return gulp.src(js.test)
    .pipe(jshint('build/jshint.test.json'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint.run', ['lint.main', 'lint.test']);

gulp.task('watch.lint', function () {
    gulp.watch(js.main, ['lint.main']);
    gulp.watch(js.test, ['lint.test']);
});

gulp.task('lint', function (done) {
    if (gutil.env.watch) {
        sequence('lint.run', 'watch.lint', done);
    } else {
        sequence('lint.run', done);
    }
});

gulp.task('style.run', function (done) {
    gulp.src(js.all)
    .pipe(jscs('build/jscs.json'))
    .on('error', function (error) {
        gutil.log(gutil.linefeed + error.message);
    })
    .on('finish', done);
});

gulp.task('watch.style', function () {
    gulp.watch(js.all, ['style.run']);
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
        gulp.src(js.test)
        .pipe(mocha({reporter : gutil.env.reporter || 'dot'}))
        .on('error', function (error) {
            gutil.log(gutil.colors.red(error.message));
        })
        .pipe(gutil.env.coverage ? istanbul.writeReports('coverage') : gutil.noop())
        .on('finish', done);
    }
    if (gutil.env.coverage) {
        gulp.src(js.main)
        .pipe(istanbul())
        .on('finish', runTests);
    } else {
        runTests();
    }
});

gulp.task('watch.test', function () {
    gulp.watch(js.all, ['test.run']);
});

gulp.task('test', function (done) {
    if (gutil.env.watch) {
        sequence('test.run', 'watch.test', done);
    } else {
        sequence('test.run', done);
    }
});

gulp.task('all', ['lint', 'style', 'test']);
