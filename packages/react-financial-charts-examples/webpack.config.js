const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTemplate = require("html-webpack-template");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
    devtool: "source-map",
    devServer: {
        compress: true,
        contentBase: "./dist",
        historyApiFallback: true,
        inline: true,
        watchContentBase: true,
        port: 8000,
    },
    mode: "development",
    entry: {
        main: "./src/index.tsx",
    },
    output: {
        filename: "[name].[chunkhash:8].js",
        chunkFilename: "[name].[chunkhash:8].js",
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        path: path.join(__dirname, "dist"),
        publicPath: "/"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/,
        }, {
            test: /\.(css)$/,
            use: [{
                loader: MiniCssExtractPlugin.loader
            }, {
                loader: "css-loader"
            }, {
                loader: "postcss-loader",
            }]
        }, {
            test: /\.(png|jpe?g|gif|woff2?|ttf|eot|ico|mp4)$/,
            use: [{
                loader: "file-loader",
                options: {
                    name: "[name].[hash:8].[ext]"
                }
            }]
        }]
    },
    node: {
        dgram: "empty",
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty",
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash:8].css",
            chunkFilename: '[name].[contenthash:8].chunk.css',
        }),
        new HtmlWebpackPlugin({
            inject: false,
            template: HtmlWebpackTemplate,
            appMountId: "app",
            headHtmlSnippet: "<style>body {margin:0; height:100vh; display:flex; overflow-x:hidden; user-select:none; -webkit-user-select:none;} #app {flex: 1;display: flex;}</style>",
            bodyHtmlSnippet: "<noscript>You need to enable JavaScript to run this app!</noscript>",
            lang: "en",
            meta: [{
                name: 'viewport',
                content: 'width=device-width,initial-scale=1,minimum-scale=1'
            }, {
                name: "description",
                content: "React Financial Charts"
            }],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
            title: "React Financial Charts"
        }),
    ]
};
