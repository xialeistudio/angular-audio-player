/**
 * @author xialei <xialeistudio@gmail.com>
 */
(function () {
    "use strict";
    /**
     * 加载插件
     * @type {exports}
     */
    var gulp = require('gulp');
    var del = require('del');
    var cssmin = require('gulp-cssmin');
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');

    /**
     * 清空目录的命令
     */
    gulp.task('clean', function () {
        del(['build']);
    });
    gulp.task('css', function () {
        /**
         * 加载源代码
         */
        return gulp.src([
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
            'bower_components/font-awesome/css/font-awesome.min.css',
            'css/style.css'
        ])
        /**
         * 压缩css
         */
            .pipe(cssmin())
        /**
         * 连接压缩后的css
         */
            .pipe(concat('style.css'))
        /**
         * 输出到目标目录
         */
            .pipe(gulp.dest('build/css'))
    });
    gulp.task('js', function () {
        return gulp.src([
        /**
         * 加载源代码
         */
            'bower_components/angular/angular.min.js',
            'bower_components/angular-sanitize/angular-sanitize.min.js',
            'js/main.js'])
        /**
         * 压缩Js
         */
            .pipe(uglify())
        /**
         * 合并js
         */
            .pipe(concat('main.js'))
        /**
         * 输出到目标目录
         */
            .pipe(gulp.dest('build/js'))
    });
    gulp.task('img', function () {
        /**
         * 加载源文件
         */
        return gulp.src([
            'img/*.*'
        ])
        /**
         * 输出到目标目录
         */
            .pipe(gulp.dest('build/img'));
    });
    gulp.task('fonts',function(){
       return gulp.src('bower_components/font-awesome/fonts/*')
           .pipe(gulp.dest('build/fonts'))
    });

    /**
     * 定义默认任务，此任务依赖于 clean,img,css,js，所以在执行
     * 本任务时会按顺序先执行依赖任务
     */
    gulp.task('default', ['clean', 'fonts','img', 'css', 'js']);
})();