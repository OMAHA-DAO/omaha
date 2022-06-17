const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack2');
var HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin;

const glob = require("glob");
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const webpack = require('webpack');

const root = path.resolve( path.resolve( __dirname+"/..") );
const isDev = argv.mode === 'development';
const isProd = !isDev;

let files = {
    'bundle.js' : './src/script.js',
    'css/styles': './src/styles.css',

	'css/404': './src/404.css',
};

const optimization = () => {
    const config = {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]|[\\/]includes[\\/]/,
                    chunks: 'all',
                    minSize: 999999999,

                    name(module, chunks, cacheGroupKey) {
                        let name = chunks.map((item) => item.name).join('~');
                        return cacheGroupKey+"/"+name;
                    },
                },
            }

        },
    };

    if (isProd) {
        config.minimizer = [
            new UglifyJsPlugin({
                test: /\.js($|\?)/i,
            })
        ]
    }

    return config
};

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins:[
            '@babel/proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-transform-typescript',
            '@babel/transform-runtime',
        ]
    };

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
};

function del_file_folder(path_prod,extension){
    path_prod = path_prod.replaceAll('\\', '/');

    let unlinked = [];
    glob(`${path_prod}/**/*.${extension}`, function (er, files) {

        files.forEach(file => {
            fs.unlinkSync(path.resolve(file));
            unlinked.push(file);
        })

    });

    if (unlinked.length > 0) {
        console.log("================");
        console.log('Removed files: ', unlinked );
        console.log("================");
    }

}

// let files = {
//
// 	'src/styles.min': "./static/css/s.sass",
//
// };

module.exports = {
    watch: isDev,
    entry: files,
    output: {
        path: root + '/dist/',
        filename: "[name].js",
        chunkFilename: 'js/modules/[name].[chunkhash].js',
        publicPath: "/"
        //sourceMapFilename: '[name].js.map'
    },

    //entry: path.resolve(__dirname, '../src/script.js'),
    // output:
    // {
    //     filename: 'bundle.[contenthash].js',
    //     path: path.resolve(__dirname, '../dist')
    // },

    mode: argv.mode,
    devtool: isDev === true ?'inline-source-map' : false,
    optimization: optimization(),
    plugins:
    [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') }
            ]
        }),
        new HtmlWebpackPlugin({
	        filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.html'),
            minify: true,
	        chunks: ['main']
            //excludeAssets: [/css\/.*js/],
        }),
	    new HtmlWebpackPlugin({
		    filename: '404.html',
		    template: path.resolve(__dirname, '../src/404.html'),
		    minify: true,
		    chunks: ['404']
		    //excludeAssets: [/css\/.*js/],
	    }),
        new HtmlWebpackSkipAssetsPlugin({
            excludeAssets: [/css\/.*js/]
        }),

        new MiniCSSExtractPlugin({
            filename: "[name].css",
        }),

        new WebpackOnBuildPlugin(async function(stats) {
            await del_file_folder(root+"/dist/css","js");
        }),

	    new webpack.ProvidePlugin({
		    $: 'jquery',
		    jQuery: 'jquery'
	    }),
    ],
    module:
    {
        rules:
        [
            // HTML
            {
                test: /\.(html)$/,
                use: {
                    loader: "html-loader",
                    options: {
                        sources: false,
                    }
                }
            },

            // JS (MAIN)
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [/*'@babel/plugin-syntax-jsx', */'@babel/proposal-class-properties', '@babel/plugin-proposal-object-rest-spread','@babel/plugin-syntax-dynamic-import',
                            // Set import path replaces (e.g. ~/ -> root)
                            // [
                            //     'babel-plugin-root-import',
                            //     {
                            //         "paths": [
                            //             {
                            //                 "rootPathSuffix": root+"/",
                            //                 "rootPathPrefix": "~/"
                            //             },
                            //             {
                            //                 "rootPathSuffix": root+"/resources/",
                            //                 "rootPathPrefix": "resources/"
                            //             },
                            //         ]
                            //     }
                            // ]
                        ]
                    }
                }
            },
            {   // JS
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {   // JSX
                test: /\.(jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions('@babel/preset-react')
                }
            },

            // CSS
            {
                test: /\.css$/,
                use:
                [
                    'style-loader',
                    MiniCSSExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            url: false
                        }

                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                sourceMap: true,
                                plugins: [
                                    "autoprefixer",
                                    ["css-mqpacker", {
                                        sort: true
                                    }],
                                    "cssnano"
                                ]
                            }
                        }
                    }
                ]
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg)$/,
                use:
                [
                    {
                        loader: 'file-loader',
                        options:
                        {
                            outputPath: 'assets/images/'
                        }
                    }
                ]
            },

            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                use:
                [
                    {
                        loader: 'file-loader',
                        options:
                        {
                            outputPath: 'assets/fonts/'
                        }
                    }
                ]
            }
        ]
    }
};
