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
gulp.task('serve', ['sass', 'html', 'copy'], function() {

    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
    });

    gulp.watch("./src/scss/**/*.scss", ['sass']);
    //gulp.watch("./src/scss/*.scss", ['sass']);
    gulp.watch("./src/js/*.js", ['js-watch']);
    gulp.watch("./src/*.html", ['html-watch']);
    gulp.watch("./src/img/**/*", ['copy']);
    gulp.watch("./src/fonts/**/*", ['copy']);
});


// Compile SASS files
// Concates all the sass files into one file: main.css
// Then removes all unused css
// Finally minimizes the file and places it into /dist/css
gulp.task('sass', function() {
    return gulp.src("./src/scss/base.scss")
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe( postcss([require('autoprefixer')] ) )
        .pipe(uncss({
            ignore: [
                '.error',
                '.input-group .error',
                '.snackbar',
                '.snackbar *',
                '.snackbar .toast',
                '.snackbar .toast-error',
                '.toast',
                'em',
                '.fa',
                '.fa-check',
                '.fa-times',
                '.snackbar .toast-success'
            ],
            html: ['./src/index.html']
        }))
        .pipe(nano())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browserSync.stream());
});

gulp.task('copy', function() {
    gulp.src('./src/img/**/*')
        .pipe(gulp.dest('./dist/img/'));
    gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./dist/fonts/'));
    gulp.src('./code-examples/**/*')
        .pipe(gulp.dest('./dist/code-examples/'));
    browserSync.reload;
});


// process js files and return the stream
gulp.task('js', function () {
    return gulp.src("./src/js/*js")
        .pipe(uglify())
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/js'));
});


gulp.task('html', function () {
    return gulp.src("./src/*.html")
        .pipe(gulp.dest("./dist"))
        .pipe(browserSync.stream());
});

gulp.task('html-watch', ['html'], browserSync.reload);

// create a task that ensures the 'js' task is complete before
// reloading browsers
gulp.task('js-watch', ['js'], browserSync.reload);

gulp.task('default', ['serve']);

gulp.task('build', ['sass', 'copy', 'html', 'js']);
