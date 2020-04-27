const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const distPath = path.resolve(__dirname, 'dist');

// This is main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = {
    // Path to your entry point. From this file Webpack will begin his work
    entry: './src/index.ts',

    // Path and filename of your result bundle.
    // Webpack will bundle all JavaScript into this file
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
    },

    // Default mode for Webpack is production.
    // Depending on mode Webpack will apply different things
    // on final bundle. For now we don't need production's JavaScript
    // minifying and other thing so let's set mode to development
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
         contentBase: './dist',
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            "self/": path.resolve(__dirname, "src/")
        }
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                strictMath: true,
                            },
                        },
                    },
                ],
            },
        ],
    },

    optimization: {
        usedExports: true,
        splitChunks: {
            chunks: 'all',
        },
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new CopyPlugin([
            {
                from: 'src_assets/icons',
                to: path.resolve(distPath, "icons")
            },
            {
                from: 'src_assets/data',
                to: path.resolve(distPath, "data")
            },
            {
                from: 'src_assets/images',
                to: path.resolve(distPath, "images")
            },
            {
                from: 'src_assets/manifiest.json',
                to: path.resolve(distPath, "manifest.json")
            },
        ]),

    ]
};