var gulp = require("gulp");
var jshint = require("gulp-jshint");
var jasmine = require("gulp-jasmine");
var istanbul = require("gulp-istanbul");

var jsFiles = [
	"./**/*.js",
	"!node_modules/**/*",
	"!coverage/**/*",
	"!examples/node_modules/**/*",
	"!examples/staticServer/**/*",
	"!examples/lib/**/*",
	"!./**/*.built.js",
	"!./dist/**/*"
];

gulp.task("test", ["jshint", "istanbul"]);

gulp.task("jasmine", function() {
	return gulp.src("src/**/*[sS]pec.js")
		.pipe(jasmine({
			verbose: true
		}));
});

gulp.task("jshint", function() {
	return gulp.src(jsFiles)
		.pipe(jshint(".jshintrc"))
		.pipe(jshint.reporter("jshint-stylish"))
		.pipe(jshint.reporter("fail"));
});

gulp.task("pre-test", function () {
	return gulp.src(["src/**/!(*[sS]pec).js"])
		// Covering files 
		.pipe(istanbul())
		// Force `require` to return covered files 
		.pipe(istanbul.hookRequire());
});
		
gulp.task("istanbul", ["pre-test"], function () {
	return gulp.src(["src/**/*[sS]pec.js"])
		.pipe(jasmine())
		// Creating the reports after tests ran 
		.pipe(istanbul.writeReports())
		// Enforce a coverage of at least 90% 
		.pipe(istanbul.enforceThresholds({ thresholds: { global: 50 } }));
});