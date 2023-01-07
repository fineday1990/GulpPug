//gulp
const gulp = require('gulp');
//компилирует sass код в css
const sass = require('gulp-sass')(require('sass'));
//меняет название например main.css в main.min.css
const rename = require('gulp-rename');
//удаляет пробелы и сжимает css файл
const cleanCSS = require('gulp-clean-css');
//переводит новые стандарты js в более ранние версии
const babel = require('gulp-babel');
//сжимает js файлы
const uglify = require('gulp-uglify');
//отображает в панели разработчика в каком файле и на какой строке находится элемент
const sourcemaps = require('gulp-sourcemaps');
//добавляет автопрефиксы в CSS файл
const autoprefixer = require('gulp-autoprefixer');
//соединяет js файлы в один
const concat = require('gulp-concat');
//сжимает картинки
const imagemin = require('gulp-imagemin');
//показывает размер папок и файлов в терминале
const size = require('gulp-size');
//плагин для компиляции Pug
const gulpPug = require('gulp-pug');
//позволяет отслеживать новые файлы
const newer = require('gulp-newer');
//запускает браузер, замена live server
const browserSync = require('browser-sync').create();
//удаляет фалы из папки, чистит папку dist
const del = require('del');

// Настройка путей
const paths = {
    pug: {
        src: 'src/*.pug',
        dest: 'dist/',
    },
    styles: {
        src: ['src/styles/**/*.sass', 'src/styles/**/*.scss'],
        dest: 'dist/css/',
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/js/',
    },
    images: {
        src: 'src/img/**',
        dest: 'dist/img/',
    },
};

//очистка
function clean() {
    return del(['dist/*', '!dist/img']);
}

//работа с Pug
function pug() {
    return gulp
        .src(paths.pug.src)
        .pipe(gulpPug())
        .pipe(size())
        .pipe(gulp.dest(paths.pug.dest))
        .pipe(browserSync.stream());
}

// работа со стилями
function styles() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(
            autoprefixer({
                cascade: false,
            })
        )
        .pipe(
            cleanCSS({
                level: 2,
            })
        )
        .pipe(
            rename({
                basename: 'main',
                suffix: '.min',
            })
        )
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

// работа со скриптами
function scripts() {
    return gulp
        .src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

// сжатие изображений
function img() {
    return gulp
        .src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 80, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
            ])
        )
        .pipe(size({ showFiles: true }))
        .pipe(gulp.dest(paths.images.dest));
}

// отслеживает изменения
function watch() {
    browserSync.init({
        server: {
            baseDir: './dist',
        },
    });
    gulp.watch(paths.pug.dest).on('change', browserSync.reload);
    gulp.watch(paths.pug.src, pug);
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.images.src, img);
}

// series задает порядок выполения по очереди, parallel- параллельно
const build = gulp.series(
    clean,
    pug,
    gulp.parallel(styles, scripts, img),
    watch
);

exports.clean = clean;
exports.img = img;
exports.pug = pug;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;
