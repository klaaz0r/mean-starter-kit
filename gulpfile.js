var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
    htmlmin = require('gulp-htmlmin'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    image = require('gulp-image'),
    concat = require('gulp-concat'),
    bower = require('gulp-bower'),
    iife = require("gulp-iife"),
    addStream = require('add-stream'),
    gulpNgConfig = require('gulp-ng-config');
strip = require('gulp-strip-comments');

//input files to work with, this keeps everything organised
input = {
    // **/*.extension gets all nested files
    'sass': 'src/assets/scss/**/*.scss',
    //all the js for design
    'javascript': 'src/assets/js/**/*.js',
    //for the html views
    'html': 'src/**/*.html',
    //the complete angular app'angular': 'src/app/**/*.js',
    //bower components are moved (only the minjs files )
    'vendor': 'bower_components/**/*.min.js',
    //angular source
    'angular': 'src/app/**/*.js',
    //image folder
    'images': 'src/assets/images/**/*'
};

//where we save the files to once gulp is done with them
output = {
    'stylesheets': 'public/assets/css',
    'javascript': 'public/assets/js',
    'images': 'public/images',
    'root': 'public',
    'app': 'public/app',
    'vendor': 'public/vendor'
};

/* run the watch task when gulp is called without arguments */
gulp.task('default', ['watch', 'start-server']);

/* this tasks runs on the server and creates all the files */
gulp.task('build', ['bower', 'css', 'javascript', 'angular', 'html', 'images']);

//starting express with the server.js file
gulp.task('start-server', function() {
    nodemon({
        script: 'server.js',
        env: {
            'NODE_ENV': 'development'
        }
    })
});

/* Run "bower install" */
gulp.task('bower_install', function(cb) {
    return bower();
    cb(err);
});
/* sync bower functions*/
gulp.task('bower', ['bower_install'], function() {
    return gulp.src(input.vendor)
        .pipe(gulp.dest(output.vendor))
        .pipe(livereload());
});

/* run javascript through jshint */
gulp.task('jshint', function() {
    return gulp.src(input.javascript)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
});

/* compile scss files and minify them */
gulp.task('css', function() {
    return gulp.src(input.sass)
        .pipe(sass())
        .pipe(cssmin())
        .pipe(gulp.dest(output.stylesheets))
        .pipe(livereload());
});


/* this is not angular! this is only js for design*/
gulp.task('javascript', function() {
    return gulp.src(input.javascript)
        .pipe(uglify())
        .pipe(gulp.dest(output.javascript))
        .pipe(livereload());
});

/* basic build html for development*/
gulp.task('html', function() {
    return gulp.src(input.html)
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(strip())
        .pipe(gulp.dest(output.root))
        .pipe(livereload());
});

/* build angular file
WARNING: minify and uglify do not work atm! ONLY CONCAT TO ONE FILE!
*/
gulp.task('angular', function() {
    return gulp.src(input.angular)
        .pipe(process.env.NODE_ENV === 'production' ? addStream.obj(config('production')) : addStream.obj(config('development')))
        .pipe(concat('app.js'))
        .pipe(iife())
        .pipe(strip())
        .pipe(gulp.dest(output.app))
        .pipe(livereload());
});

/* moving all the images to public*/
gulp.task('images', function() {
    return gulp.src(input.images)
        .pipe(image())
        .pipe(gulp.dest(output.images))
        .pipe(livereload());
});

//setup the correct settings
function config(state) {
    return gulp.src('./app.config.json')
        .pipe(gulpNgConfig('app.config', {
            environment: state
        }));
}
/* Watch these files for changes and run the task on update */
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(input.javascript, ['jshint', 'javascript']);
    gulp.watch(input.sass, ['css']);
    gulp.watch(input.html, ['html']);
    gulp.watch(input.angular, ['angular']);
    gulp.watch(input.images, ['images']);
});
