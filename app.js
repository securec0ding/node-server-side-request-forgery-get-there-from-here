const express = require('express')
const http = require('http')
const morgan = require('morgan')
const morganBody = require('morgan-body')
const ip = require("ip")
const os = require("os")
require('dotenv').config()

const app = express()
const port = process.env.PORT || process.env.VIRTUAL_PORT || 3000
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(morgan('combined'))
morganBody(app, {noColors: true, prettify: false, maxBodyLength: 8000})

const internalServer = "10.0."

app.get('/', (req, res) => { 
  res.send("App is running...")
})

/**
 * uses the "subdomain" query parameter to get and display
 * the contents of [subdomain].example.com
 */
app.get('/get', (req, res) => {

  // if there is a "subdomain" query parameter
  if (req.query.subdomain) {
    const fullDomain = `http://${req.query.subdomain}.example.com`

    // request example.com with the provided subdomain
    // send the data or an error message
    http.get(fullDomain, httpRes => {
      let data = '';
      httpRes.on('data', chunk => {
        data += chunk;
      });
      httpRes.on('end', () => {
        res.send(data)
      })
    }).on('error', err => {
      res.send(`<h4 style="color:red">${err}</h4>`)
    })

  } else {
    res.send('Please provide a subdomain.')
  }
})

/**
 * provides a secret token to internal requests 
 * sends an error message to external requests
 */
app.get('/token/secret', (req, res) => {
  const { remoteAddress } = req.socket
  // only accept internal requests
  if (remoteAddress.includes(internalServer) && req.get("host").includes(internalServer)) {
    res.send(`Successful internal connection from ${remoteAddress} <br/> SECRET:${process.env.PATH}`)
  } else {
    res.send(`[SERVER ${os.hostname}/${ip.address()}:${port}] - UNAUTHORIZED CONNECTION FROM: ${remoteAddress}`)
  }
})

/**
 * provides a public token to all requests
 */
app.get('/token/public', (req, res) => {
  res.send("PUBLIC:TOKEN")
})

app.listen(port, () => {
  console.log(`Server running...`)
})
