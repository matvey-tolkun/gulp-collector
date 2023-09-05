const {src, dest, watch, parallel, series} = require('gulp')
const concat = require('gulp-concat')
const scss = require('gulp-sass')(require('sass'))
const uglifyEs = require('gulp-uglify-es').default
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
const autoprefixer = require('gulp-autoprefixer')
const clean = require('gulp-clean')
const avif = require('gulp-avif')
const webp = require('gulp-webp')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const svgSprite = require('gulp-svg-sprite')
const fonter = require('gulp-fonter')
const ttf2woff2 = require('gulp-ttf2woff2')
const include = require('gulp-include')

const pages = () =>
	src('source/pages/*.html')
	.pipe(include({
		includePaths: 'source/html'
	}))
	.pipe(dest('source'))
	.pipe(browserSync.stream())

const fonts = () =>
	src('source/fonts/src/*.*')
 	.pipe(fonter({
		formats: ['woff', 'ttf']
	}))
	.pipe(src('source/fonts/*.ttf'))
	.pipe(ttf2woff2())
	.pipe(dest('source/fonts'))

const sprite = done =>
	src('source/img/*.svg')
	.pipe(svgSprite({
		mode: {
			stack: {
				sprite: '../sprite.svg',
				example: true
			}
		}
	}))
	.pipe(dest('source/img'))
	.on('end', done)

const images = () =>
	src(['source/img/src/*.*', '!source/img/src/*.svg'])
	.pipe(newer('source/img'))
	.pipe(avif({quality: 50}))

	.pipe(src('source/img/src/*.*'))
	.pipe(newer('source/img'))
	.pipe(webp())
	
	.pipe(src('source/img/src/*.*'))
	.pipe(newer('source/img'))
	.pipe(imagemin())

	.pipe(dest('source/img'))

const styles = () =>
	src('source/sass/style.sass')
	.pipe(autoprefixer({overrideBrowserslist : ['last 10 version']}))
	.pipe(concat('style.min.css'))
	.pipe(scss({outputStyle: 'compressed'}))
	.pipe(dest('source/css'))
	.pipe(browserSync.stream())
	
const scripts = () =>
	src('source/js/main.js')
	.pipe(concat('main.min.js'))
	.pipe(uglifyEs())
	.pipe(dest('source/js'))
	.pipe(browserSync.stream())
	
const watching = () => {
	browserSync.init({
		server: {
			baseDir: "source/"
		}
	});

	watch(['source/sass/**/*.sass'], styles)
	watch(['source/img/src'], images)
	watch(['source/js/main.js'], scripts)
	watch(['source/html/**/*', 'source/pages/*'], pages)
	watch(['source/*.html']).on("change", reload)
}

const cleanBuild = () => src('build').pipe(clean())

const build = () => src([
	'source/css/style.min.css',
	'!source/img/**/*.html',
	'source/img/*.*',
	'!source/img/*.svg',
	'source/img/sprite.svg',
	'source/fonts/*.*',
	'source/js/main.min.js',
	'source/*.html'
	], {base: 'source'})
	.pipe(dest('build'))
	
exports.styles = styles
exports.scripts = scripts
exports.watching = watching
exports.images = images
exports.sprite = sprite
exports.fonts = fonts
exports.build = build
exports.pages = pages

exports.buildProject = series(cleanBuild, build)
exports.default = parallel(styles, images, scripts, pages, watching)