var gulp = require("gulp"),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass')(require('sass'));
	sourcemaps = require("gulp-sourcemaps"),
	plumber = require("gulp-plumber"),
	webpack = require("webpack-stream"),
	rename = require("gulp-rename"),
	tap = require("gulp-tap"),
	jsRender = require("jsrender"),
	path = require("path"),
	browserSync = require("browser-sync").create(),
	fs = require("fs");
registerPartialTag();

gulp.task("sass", async function() {
	return gulp.src("src/styles/combos/*.scss", {base: "src/styles/combos"})
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(rename({suffix: ".min"}))
	.pipe(sass({outputStyle: "compressed"}).on('error', sass.logError))
	.pipe(sourcemaps.write("./"))
	.pipe(gulp.dest("src/styles/outputs"))
	.pipe(browserSync.stream());
});

gulp.task("sass-local-vendor", async function() {
	return gulp.src("src/styles/local-vendor/*.scss", {base: "src/styles/local-vendor"})
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(rename({suffix: ".min"}))
	.pipe(sass({outputStyle: "compressed"}).on('error', sass.logError))
	.pipe(sourcemaps.write("./"))
	.pipe(gulp.dest("src/styles/outputs"))
	.pipe(browserSync.stream());
});
gulp.task("scripts", async  function() {
	return gulp.src("src/scripts/combos/*.js", {base: "src/scripts/combos"})
	.pipe(webpack(require('./webpack.config.js')))
	.pipe(gulp.dest("src/scripts/outputs"));
});

gulp.task("html", async function() {
	return gulp.src("src/html/!(outputs)/*.html", {base: "src/html/"})
	.pipe(tap(function (file) {
        try{
            let template = jsRender.templates(file.contents.toString());
            let filePath = path.dirname(file.path);
            let fileName = path.basename(file.path, ".html") + ".json";
            let renderData = require(filePath + "/" + fileName);

            template = template.render(renderData);

            file.contents = new Buffer(template);
        }
        catch (e) {
            console.log("Error: Unable to process layout " + path.basename(file.path));
            console.log(e);

        }
    }))
	.pipe(gulp.dest("src/html/outputs/"));
});


gulp.task("browserSync", function() {
	return browserSync.init({
		server: {
			baseDir: "./",
			index: "dist/index.html",
		}
	});
});

gulp.task("watch", function() {
	gulp.watch("src/styles/!(outputs)/*.scss", gulp.series("sass"));
	gulp.watch("src/scripts/outputs/*.js", gulp.series("scripts")).on('change', browserSync.reload);
	gulp.watch("src/html/!(outputs)/*.html", gulp.series("html")).on('change', browserSync.reload);
});
gulp.task("default", gulp.series("sass", "scripts", "html", "browserSync", "watch"));
// gulp.task("default", gulp.series("sass", "scripts", "html", "watch"));

function registerPartialTag() {
    jsRender.views.tags("partial", function (path) {
        try{
            let rawTemplate = fs.readFileSync(path, "utf8");
            let template = jsRender.templates(rawTemplate);
            let variables = this.tagCtx.view.data;

            return template.render(variables);
        }
        catch (e) {
            console.log("Error: Unable to load partial on path "+path);
            console.log(e);

            return "";
        }
    });
}
