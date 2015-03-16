/**
 * @author xialei <xialeistudio@gmail.com>
 */
(function () {
    "use strict";
    var gulp = require('gulp');
    var del = require('del');
    var cssmin = require('gulp-cssmin');
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    gulp.task('clean', function () {
        del(['build']);
    });
    gulp.task('css', function () {
        return gulp.src([
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
            'bower_components/font-awesome/css/font-awesome.min.css',
            'css/style.css'
        ])
            .pipe(cssmin())
            .pipe(concat('style.css'))
            .pipe(gulp.dest('build/css'))
    });
    gulp.task('js', function () {
        return gulp.src([
            'bower_components/angular/angular.min.js',
            'bower_components/angular-sanitize/angular-sanitize.min.js',
            'js/main.js'])
            .pipe(uglify())
            .pipe(concat('main.js'))
            .pipe(gulp.dest('build/js'))
    });
    gulp.task('img', function () {
        return gulp.src([
            'img/*.*'
        ])
            .pipe(gulp.dest('build/img'));
    });

    gulp.task('default',['clean','img','css','js']);
})();