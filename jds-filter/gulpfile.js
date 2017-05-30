'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jison = require('gulp-jison');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var path = require('path');

gulp.task('jison', function() {
    return gulp.src('./src/*.jison')
        .pipe(jison())
        .pipe(gulp.dest('./lib/'));
});

gulp.task('browserify', ['jison'], function() {
    var input = './src/jds-filter.js';
    return browserify({
        entries: [path.resolve(input)],
        standalone: path.basename(input, '.js')
    })
        .bundle()
        .pipe(source(input))
        .pipe(rename('jds-filter.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./dist'))
        .pipe(rename('jds-filter.min.js'))
        .pipe(uglify({compress: {dead_code: true}}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('test', ['jison'], function() {
    return gulp.src('./src/**/*-spec.js', {read: false})
        .pipe(mocha({
            require: [path.resolve('./mocha-helper.js')]
        }));
});

gulp.task('default', ['jison', 'browserify']);

