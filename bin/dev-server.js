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


app.get('/address', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'address.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})


app.get('/rewards', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'rewards.html')

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

app.get('/validation', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'validation.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.get('/flip', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'flip.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})




app.get('/tx', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'tx.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})



app.get('/block', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'block.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})


app.get('/answers', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'answers.html')

  compiler.outputFileSystem.readFile(file,  (err, result) => {
    if (err) {
      return next(err)
    }

    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})




app.get('/identity', function (req, res, next) {
  const file = path.join(compiler.outputPath, 'identity.html')

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
