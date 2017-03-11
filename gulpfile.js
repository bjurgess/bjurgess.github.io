var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uncss = require('gulp-uncss');
var nano = require('gulp-cssnano');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');


// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'html'], function() {

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("./scss/**/*.scss", ['sass']);
    //gulp.watch("./src/scss/*.scss", ['sass']);
    gulp.watch("./*.html", ['html-watch']);
});


// Compile SASS files
// Concates all the sass files into one file: main.css
// Then removes all unused css
// Finally minimizes the file and places it into /dist/css
gulp.task('sass', function() {
    return gulp.src("./scss/base.scss")
        .on('error', function (err) {
            console.error("Error!", err.message);
            })
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe( postcss([require('autoprefixer')] ) )
        .pipe(nano())
        .pipe(gulp.dest("./css"))
        .pipe(browserSync.stream());
});


// process js files and return the stream
gulp.task('js', function () {
    return gulp.src("./src/js/*js")
        .pipe(uglify())
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./js'));
});


gulp.task('html', function () {
    return gulp.src("./*.html")
        .pipe(browserSync.stream());
});

gulp.task('html-watch', ['html'], browserSync.reload);

// create a task that ensures the 'js' task is complete before
// reloading browsers
gulp.task('js-watch', ['js'], browserSync.reload);

gulp.task('default', ['serve']);

gulp.task('build', ['sass', 'html', 'js']);
