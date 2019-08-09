var gulp       = require('gulp');
var uglify     = require('gulp-uglify');
var eslint     = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('gulp-browserify');
var rename     = require('gulp-rename');

// path

var path = {
  src : {
    js       : 'src/**/*.js'
  },
  build : {
    src      : 'build',
    mainJs   : 'build/gameTurf.js'
  },
  release : {
    main    : 'release/'
  }
};

// Error

function onError(e) {
  console.error(e);
}

// Build JS

gulp.task('build-js', function(){
    return gulp.src(path.src.js)
               //.pipe(eslint())
               //.pipe(eslint.formatEach())
               //.pipe(eslint.failAfterError())
               .on('error', onError)
               .pipe(gulp.dest(path.build.src));
});

gulp.task('bundle-js', ['build-js'], function(){
    return gulp.src(path.build.mainJs)
               .pipe(browserify({
                    standalone: 'gameTurf',
                    read: false
               }))
               .on('error', onError)
               .pipe(gulp.dest(path.build.src));
});

// Release JS

gulp.task('release-js', ['build'], function(){
  return gulp.src(path.build.mainJs)
             .on('error', onError)
             .pipe(gulp.dest(path.release.main))
             .pipe(sourcemaps.init())
             .pipe(uglify().on('error', function(e){
                console.log(e);
             }))
             .pipe(rename({
                 suffix: "-min"
              }))
             .pipe(sourcemaps.write('./'))
             .pipe(gulp.dest(path.release.main));
});

gulp.task('default', ['build']);
gulp.task('release', ['release-js']);
gulp.task('build', ['bundle-js']);
