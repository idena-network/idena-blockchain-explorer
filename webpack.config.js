var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var webpack = require('webpack')
var merge = require('webpack-merge')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var postCssConfig = require('./postcss.config')

const cwd = process.cwd()
const stylePaths = [
  path.join(cwd, 'src/styles')
]

const commonConfig = {
  resolve: {
    extensions: ['.js', '.scss']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: [
          path.join(__dirname, 'src')
        ]
      },
      {
        test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }]
      },
      {
        test: /\.jpg$/,
        loaders: ['file-loader']
      },
      {
        test: /\.png$/,
        loaders: ['file-loader']
      },
      {
        test: /\.svg$/,
        loaders: ['file-loader']
      },
      {
        test: /\.json$/,
        loaders: ['json-loader']
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: path.join('./src'),
        postcss: postCssConfig
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      hash: false,
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/validation.html'),
      hash: false,
      filename: 'validation.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/flip.html'),
      hash: false,
      filename: 'flip.html',
    }),


    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/tx.html'),
      hash: false,
      filename: 'tx.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/block.html'),
      hash: false,
      filename: 'block.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/answers.html'),
      hash: false,
      filename: 'answers.html',
    }),


    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/epoch.html'),
      hash: false,
      filename: 'epoch.html',
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/address.html'),
      hash: false,
      filename: 'address.html',
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/rewards.html'),
      hash: false,
      filename: 'rewards.html',
    }),


    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/reward.html'),
      hash: false,
      filename: 'reward.html',
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/identity.html'),
      hash: false,
      filename: 'identity.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/404.html'),
      hash: false,
      filename: '404.html',
    })
  ]
}

const developmentConfig = {
  entry: {
    index: [
      path.resolve('./src/index.js'),
      'webpack-hot-middleware/client?path=/__webpack_hmr'
    ]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.join(__dirname, '/'),
    publicPath: 'http://localhost:3000/assets/'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader'
        ],
        include: stylePaths
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ],
        include: stylePaths
      }
    ]
  }
}

const buildConfig = {
  entry: {
    index: path.resolve('./src/index.js')
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.join(__dirname, '/dist'),
    publicPath: ''
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css?[hash:8]',
      allChunks: true,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.font.js$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        }),
        include: stylePaths
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!postcss-loader!sass-loader',
        }),
        include: stylePaths
      }
    ]
  }
}

module.exports = function (env) {
  switch (env) {
    case 'production':
      return merge(
        commonConfig,
        buildConfig
      )
    default:
      return merge(
        commonConfig,
        developmentConfig
      )
  }
}
