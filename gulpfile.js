const gulp = require("gulp");

//ライブリロード
const bs = require("browser-sync").create();

const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const htmlBeautify = require("gulp-html-beautify");
const fs = require("fs");

const imagemin = require("gulp-imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");


var imageminOption = [
  imageminPngquant({ quality: [0.65, 0.8] }),
  imageminMozjpeg({ quality: 85 }),
  imagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256
  }),
  imagemin.mozjpeg(),
  imagemin.optipng(),
  imagemin.svgo()
];

gulp.task( 'imagemin', function() {
  return gulp
    .src( './img/base/*.{png,jpg,gif,svg}' )
    .pipe( imagemin( imageminOption ) )
    .pipe( gulp.dest( './img' ) );
});


gulp.task("bs-init", function () {
  bs.init({
    server: {
      baseDir: "./dist",
    },
    reloadDelay: 1000,//リロードの遅延
    open: false, //起動時のライブリロードを止める
  });
});

// ファイルの監視
gulp.task("watch", function () {
  gulp.watch(["src/ejs/**/*.ejs"], gulp.task("ejs")); //追加
});

gulp.task("ejs", function (done) {
  const json_path = "./src/data/site.json";
  const json = JSON.parse(fs.readFileSync(json_path));
  return gulp
    .src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
    .pipe(plumber())
    .pipe( ejs({
        jsonData: json,
      })
    )
    .pipe(
      htmlBeautify({
        indent_size: 2, //インデントサイズ
        indent_char: " ", // インデントに使う文字列はスペース1こ
        max_preserve_newlines: 0, // 許容する連続改行数
        preserve_newlines: false, //コンパイル前のコードの改行
        indent_inner_html: false, //head,bodyをインデント
        extra_liners: [], // 終了タグの前に改行を入れるタグ。配列で指定。head,body,htmlにはデフォで改行を入れたくない場合は[]。
      })
    )
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest("dist/"))
    .pipe(bs.stream());//追加
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("ejs"), gulp.parallel("watch", "bs-init"))
);