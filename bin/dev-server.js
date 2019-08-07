var express = require('express')
var path = require('path')
var webpack = require('webpack')
var compress = require('compression')
var webpackConfig = require('../webpack.config')

const app = express()
const compiler = webpack(webpackConfig(process.env.NODE_ENV))

app.use(
  compress()
)

app.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: 'http://localhost:3000/assets/',
    contentBase: path.resolve(__dirname, '../src'),
    hot: true,
    lazy: false
  })
)

app.use(
  require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr'
  })
)

app.use(
  express.static(path.resolve(__dirname, '../public'))
)

app.get('/', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'index.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.get('/epoch', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'epoch.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.get('/epoch-identities', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'epoch-identities.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.get('/validation-results', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'validation-results.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.get('/404', function (req, res, next) {
  const file = path.join(compiler.outputPath, '404.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.listen(3000)
