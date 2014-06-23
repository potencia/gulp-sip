var sip = require('gulp-sip');

sip.plugin('js', {
    all : ['index.js', 'lib/gulp-sip.js', 'lib/task.js', 'lib/util.js', 'test/gulp-sip-spec.js', 'test/task-spec.js', 'test/util-spec.js'],
    main : ['index.js', 'lib/gulp-sip.js', 'lib/task.js', 'lib/util.js'],
    test : ['test/gulp-sip-spec.js', 'test/task-spec.js', 'test/util-spec.js']
});

sip.plugin('gutil', require('gulp-util'));
sip.plugin('jscs', require('gulp-jscs'));
sip.plugin('jshint', require('gulp-jshint'));
sip.plugin('istanbul', require('gulp-istanbul'));
sip.plugin('mocha', require('gulp-mocha'));
sip.plugin('sequence', require('run-sequence'));

sip.task('lint.main', 'Check main JavaScript for potential problems', function (gulp, js, jshint) {
    return gulp.src(js.main)
    .pipe(jshint('build/jshint.main.json'))
    .pipe(jshint.reporter('jshint-stylish'));
});

sip.task('lint.test', 'Check test JavaScript for potential problems', function (gulp, js, jshint) {
    return gulp.src(js.test)
    .pipe(jshint('build/jshint.test.json'))
    .pipe(jshint.reporter('jshint-stylish'));
});

sip.task('lint.run', ['lint.main', 'lint.test']);

sip.task('watch.lint', 'Continually check all JavaScript for potential problems', function (gulp, js) {
    gulp.watch(js.main, ['lint.main']);
    gulp.watch(js.test, ['lint.test']);
});

sip.task('lint', 'Check all JavaScript for potential problems', function (gutil, sequence, done) {
    if (gutil.env.watch) {
        sequence('lint.run', 'watch.lint', done);
    } else {
        sequence('lint.run', done);
    }
});

sip.task('style.run', function (gulp, js, jscs, done) {
    gulp.src(js.all)
    .pipe(jscs('build/jscs.json'))
    .on('error', function (error) {
        gutil.log(gutil.linefeed + error.message);
    })
    .on('finish', done);
});

sip.task('watch.style', 'Continually check the coding style of all JavaScript code', function (gulp, js) {
    gulp.watch(js.all, ['style.run']);
});

sip.task('style', 'Check the coding style of all JavaScript code', function (gutil, sequence, done) {
    if (gutil.env.watch) {
        sequence('style.run', 'watch.style', done);
    } else {
        sequence('style.run', done);
    }
});

sip.task('test.run', function (gulp, gutil, mocha, istanbul, js, done) {
    function runTests() {
        gulp.src(js.test)
        .pipe(mocha({reporter : gutil.env.reporter || 'dot'}))
        .on('error', function (error) {
            gutil.log(gutil.colors.bold.red(error.message) + (gutil.env.stacktrace ? (gutil.linefeed + error.stack) : ''));
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

sip.task('watch.test', 'Continually run all unit tests', function (gulp, js) {
    gulp.watch(js.all, ['test.run']);
});

sip.task('test', 'Run all unit tests', function (gutil, sequence, done) {
    if (gutil.env.watch) {
        sequence('test.run', 'watch.test', done);
    } else {
        sequence('test.run', done);
    }
});

sip.task('all', 'Run linter, style checker, and tests', ['lint', 'style', 'test']);

sip.run(require('gulp'));
