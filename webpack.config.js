const path     = require('path');
// const TerserPlugin = require("terser-webpack-plugin");
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack  = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: { 
		"geovisorbasicportalactions"				: "./src/scripts/combos/BasicPortalActions.js",
		"geovisorcontroladorherramientas"			: "./src/scripts/combos/controladorHerramientas.js",
		"geovisorcontroladorprincipal"				: "./src/scripts/combos/controladorPrincipal.js",
		"geovisorcontrolesmapa"						: "./src/scripts/combos/controlesMapa.js"
	},
	output: {
		filename: '[name].bundle.min.js',
		// path: path.resolve(__dirname, 'dist/src/scripts/outputs')
		path: path.resolve(__dirname, 'dist')
	},
	// optimization: {
	// 	minimize: true,
	// 	minimizer: [new TerserPlugin()],
	// },
	devtool: "source-map",
	watch: true,
	module: {
    rules: [
      {
        test: /jquery\.fancybox\.js$/,
        loader: "string-replace-loader",
        enforce: "pre",
        options: {
          search: "window.jQuery",
          replace: "window.jq",
          flags: "g"
        }
      }
    ]
  },
	plugins: [
		// new HtmlWebpackPlugin({
		// 	filename: '../../../index.html',
		// 	template: './src/html/outputs/pages/index.html',
		// }),
		new CopyPlugin(
			[
			  { from: "./src/data", to: "../../../dist/src/data"},
			  { from: "./src/images", to: "../../../dist/src/images"},
			  { from: "./src/scripts/base", to: "../../../dist/src/scripts/base"},
			  { from: "./src/styles/outputs", to: "../../../dist/src/styles/outputs"},
			  { from: "./src/scripts/outputs", to: "../../../dist/src/scripts/outputs"},
			  { from: "./src/html/outputs/pages/index.html", to: "../../../dist"},
			],
		),
		new webpack.optimize.CommonsChunkPlugin({
		  name: "geovisorcommons",
		  filename: "[name].bundle.min.js",
		  minChunks: 3
		})
	]
};
