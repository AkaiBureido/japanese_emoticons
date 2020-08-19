const path = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const distPath = path.resolve(__dirname, 'dist')

// This is main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = (env, argv) => {
  const isDebug = argv.mode === "development"
  const enableAnalytics = false

  let config = {
    mode: 'production',

    // Path to your entry point. From this file Webpack will begin his work
    entry: './src/index.ts',

    // Path and filename of your result bundle.
    // Webpack will bundle all JavaScript into this file
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.md'],
      alias: {
        'JEM': path.resolve(__dirname, 'src/'),
        'asset:/': path.resolve(__dirname, 'src_assets/'),
      },
    },

    module: {
      rules: [
        {
          test: /\.(mdx|md)?$/,
          use: ['babel-loader', '@mdx-js/loader'],
        },
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
              options: {
                injectType: 'lazyStyleTag',
                attributes: {
                  'data-style': 'global',
                },
              },
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
      new webpack.DefinePlugin({
        'process.env.GA': enableAnalytics ? JSON.stringify('UA-42243080-3') : "undefined",
        'process.env.DEBUG': JSON.stringify(isDebug),
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new CopyPlugin([
        {
          from: 'assets/icons',
          to: path.resolve(distPath, 'icons'),
        },
        {
          from: 'assets/data',
          to: path.resolve(distPath, 'data'),
        },
        {
          from: 'assets/fonts',
          to: path.resolve(distPath, 'fonts'),
        },
        {
          from: 'assets/images',
          to: path.resolve(distPath, 'images'),
        },
        {
          from: 'assets/manifiest.json',
          to: path.resolve(distPath, 'manifest.json'),
        },
      ]),
    ],
  }

  if (isDebug) {
    config = {
      ...config,

      // Default mode for Webpack is production.
      // Depending on mode Webpack will apply different things
      // on final bundle. For now we don't need production's JavaScript
      // minifying and other thing so let's set mode to development
      mode: 'development',
      devtool: 'inline-source-map',
      devServer: {
        contentBase: './dist',
        writeToDisk: true,
      },
    }
  }

  return config
}
