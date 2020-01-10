'use strict';

const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  autoprefixer = require('gulp-autoprefixer'),
  rimraf = require('rimraf'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  notify = require('gulp-notify'),
  gcmq = require('gulp-group-css-media-queries'),
  cleanCSS = require('gulp-clean-css'),
  cache = require('gulp-cache'),
  minJS = require('gulp-uglify'),
  replace = require('gulp-replace'),
  htmlmin = require('gulp-htmlmin'),
  rename = require('gulp-rename'),
  realFavicon = require ('gulp-real-favicon'),
  fs = require('fs'),
  includeFiles = require('gulp-rigger');


// Config autoprefixer add prefix to the browsers
const autoprefixerList = [
  'Chrome >= 45',
  'Firefox ESR',
  'Edge >= 12',
  'Explorer >= 10',
  'iOS >= 9',
  'Safari >= 9',
  'Android >= 4.4',
  'Opera >= 30'
];

// browserSync config
const config = {
  server: {
    baseDir: "app"
  },
  notify: false,
  //open: false,
  //online: false, // work offline without internet connection
  //tunnel: false, tunnel: "projectName",  demonstration http://projectname.localtunnel.me
  // startPath: 'index.html',
  host: 'localhost',
  port: 9000,
  //proxy: "yourlocal.dev",
  logPrefix: "Frontend_History_Action"
};

// Notify error
const onError = function(err) {
  notify.onError({
    title: 'Error in ' + err.plugin,
  })(err);
  this.emit('end');
};


// Deploy html files (rigger template from ./tempalte )
gulp.task('html', () =>
  gulp.src('app/*.html')
    .pipe(plumber({ errorHandler: onError }))
    //.pipe(includeFiles())
    //.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    /*.pipe(htmlmin({
     collapseWhitespace: true,
     removeComments: false
     }))*/
    //.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(gulp.dest('dist/'))
    .on('end', browserSync.reload)
);



// Deploy css via sass preprocessor
gulp.task('sass', () =>
  gulp.src('app/sass/**/*.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}))
    //.pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
    // .pipe(gcmq())
    //.pipe(concat('main.css'))
    //.pipe(rename({suffix: '.min'}))
    //.pipe(cleanCSS({level: 2}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))

);

// Copy all generated img files into build directory
gulp.task('images', () =>
  gulp.src([
    path.src.img,
    `!${path.src.src}img/uploads/*-pack/**/*.*`  // exclude source for mask *-pack/**/*.*
  ])
    .pipe(gulp.dest(path.build.img))
    .pipe(cache(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 8}),
        imagemin.svgo({
          plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
          ]
        })
      ],{
        verbose: true // output status treatment img files
      }
    )))

    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.reload({
      stream: true
    }))
);

// reload after change via browserSync
gulp.task('browserSync', () =>
    browserSync(config)
);

// delete build dir
// delete build dir
gulp.task('clean', (cb) =>
  rimraf('dist', cb)
);

// clear cashe images
gulp.task('clearCache', () =>
  cache.clearAll()
);

// Build Production Site
gulp.task('buildDist', () => {
  const buildCss = gulp.src('app/css/**/*.css')
    .pipe(gulp.dest('dist/css'));

  /*const buildJs = gulp.src('app/js/!**!/!*.js')
    .pipe(gulp.dest('dist/js'));

  const buildData = gulp.src('app/data/!**!/!*')
    .pipe(gulp.dest('dist/data'));

  const buildImages = gulp.src('app/images/!**!/!*')
    .pipe(gulp.dest('dist/images'));*/

});

gulp.task('watch', () => {
  // STYLES, SCRIPTS, HTML, IMAGES, FONTS
  gulp.watch('app/sass/**/*.scss', gulp.parallel('sass'));
  gulp.watch('app/*.html', gulp.parallel('html'));
});

/*-- MANUALLY RUN TASK --*/
// ['clean', 'validation', 'cssLint', 'clearCache', 'check-for-favicon-update']


// Build Production Site with all updates
gulp.task('build', gulp.series(['clean', gulp.parallel('html', 'sass', 'buildDist')]));

gulp.task('default', gulp.series(['build', gulp.parallel('watch', 'browserSync')]));