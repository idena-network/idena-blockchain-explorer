var path = require('path')
var fs = require('fs-extra')
var webpack = require('webpack')
var webpackConfig = require('../webpack.config')

const webpackCompiler = (webpackConfig) => {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig(process.env.NODE_ENV))

    compiler.run((err, stats) => {
      if (err) {
        console.error('Webpack compiler encountered a fatal error.', err)

        return reject(err)
      }

      const jsonStats = stats.toJson()

      console.log('Webpack compile completed.')
      console.log(
        stats.toString({
          chunks: false,
          chunkModules: false,
          colors: true
        })
      )

      if (jsonStats.errors.length > 0) {
        console.log('Webpack compiler encountered errors.')
        console.error(jsonStats.errors.join('\n'))

        return reject(new Error('Webpack compiler encountered errors.'))
      } else if (jsonStats.warnings.length > 0) {
        console.log('Webpack compiler encountered warnings.')
        console.warn(jsonStats.warnings.join('\n'))
      } else {
        console.log('No errors or warnings encountered.')
      }

      resolve(jsonStats)
    })
  })
}

const compile = () => {
  console.log('Starting compiler.')

  return Promise.resolve()
    .then(() => webpackCompiler(webpackConfig))
    .then(stats => {
      if (stats.warnings.length > 0) {
        throw new Error('Config set to fail on warning, exiting with status code "1".')
      }

      console.log('Copying static assets to dist folder.')

      fs.copySync(
        path.resolve(__dirname, '../public'),
        path.resolve(__dirname, '../dist')
      )
    })
    .then(() => {
      console.log('Compilation completed successfully.')
    })
    .catch((err) => {
      console.error('Compiler encountered an error.', err)

      process.exit(1)
    })
}

compile()
