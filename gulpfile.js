const app = require('./assemblefile');
const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const header = require('gulp-header');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rtlcss = require('rtlcss');
const flexbugs = require('postcss-flexbugs-fixes');
const brs = require('browser-sync');
const pkg = require('./package.json');

const browserSync = brs.create();
const reload = browserSync.reload;

const nmd = 'node_modules';
const vnd = 'public/assets/vendor';

const banner = ['/**',
    ' * Elektron - <%= pkg.description %>',
    ' * @version <%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' * @link <%= pkg.homepage %>',
    ' */',
    ''
].join('\n');

const browsers = [
      'Chrome >= 35',
      'Firefox >= 38',
      'Edge >= 12',
      'Explorer >= 10',
      'iOS >= 8',
      'Safari >= 8',
      'Android 2.3',
      'Android >= 4',
      'Opera >= 12'
];

gulp.task('js', () => {
  return gulp.src('js/*.js')
  .pipe(babel())
  .pipe(header(banner, {pkg}))
  .pipe(gulp.dest('public/assets/js'))
  .pipe(uglify())
  .pipe(rename({suffix: ".min"}))
  .pipe(header(banner, {pkg}))
  .pipe(gulp.dest('public/assets/js'));
});

gulp.task('css:ltr', () => {
  return gulp.src('scss/*.scss')
  .pipe(sass({
    outputStyle: 'expanded'
  }).on('error', sass.logError))
  .pipe(postcss([
    autoprefixer({browsers: browsers}),
    flexbugs()
  ]))
  .pipe(header(banner, {pkg}))
  .pipe(gulp.dest('public/assets/css'))
  .pipe(postcss([cssnano({zindex: false})]))
  .pipe(rename({suffix: '.min'}))
  .pipe(header(banner, {pkg}))
  .pipe(gulp.dest('public/assets/css'));
});

gulp.task('css:rtl', () => {
  return gulp.src('scss/*.scss')
  .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
  .pipe(postcss([
    flexbugs(),
    autoprefixer({browsers: browsers}),
    rtlcss()
  ]))
  .pipe(rename({suffix: '-rtl'}))
  .pipe(header(banner, {pkg}))
  .pipe(gulp.dest('public/assets/css'))
  .pipe(postcss([cssnano({zindex: false})]))
  .pipe(rename({suffix: '.min'}))
  .pipe(header(banner, {pkg}))
  .pipe(gulp.dest('public/assets/css'));
});

gulp.task('css', ['css:ltr']);

gulp.task('assets', () => {
    gulp.src(`${nmd}/jquery/dist/**/*.*`).pipe(gulp.dest(`${vnd}/jquery`));
    gulp.src(`${nmd}/metismenu/dist/*.*`).pipe(gulp.dest(`${vnd}/metismenu`));
    gulp.src(`${nmd}/onoffcanvas/dist/*.*`).pipe(gulp.dest(`${vnd}/onoffcanvas`));
});

gulp.task('pages', () => {
  app.build('html', function(err) {
    if (err) {
      console.error('ERROR', err);
    }
  });
});

/**
 * Serves the landing page from "public" directory.
 */
gulp.task('serve', function() {
    browserSync.init({
        notify: true,
        server: {
            baseDir: ['public']
        }
    });
    watch();
});

/**
 * Defines the list of resources to watch for changes.
 */
function watch() {
    gulp.watch(['templates/**/*.hbs'], ['pages', reload]);
    gulp.watch(['js/**/*.js'], ['js', reload]);
    gulp.watch(['scss/**/*.scss'], ['css', reload]);
}



gulp.task('default', ['pages', 'assets', 'js', 'css'], () => {});