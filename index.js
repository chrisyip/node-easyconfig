'use strict'

const isPlainObj = require('is-plain-obj')
const path = require('path')
const os = require('os')

const EasyConfig = require('./easy-config')

module.exports = (...args) => {
  const env = process.env
  let options = {}

  if (isPlainObj(args[0])) {
    options = args[0]
  } else {
    options.basedir = args[0]
    options.name = args[1]
  }

  if (options.basedir == null) {
    options.basedir = env.NODE_CONFIG_ENV || path.join(process.cwd(), 'config')
  }

  if (args[2]) {
    options = Object.assign({}, args[2], options)
  }

  if (options.name == null) {
    options.name = env.NODE_CONFIG_ENV || env.NODE_ENV || 'development'
  }

  if (options.instance == null && env.NODE_APP_INSTANCE) {
    options.instance = env.NODE_APP_INSTANCE
  }

  if (options.hostname == null) {
    const hostname = process.env.HOST || process.env.HOSTNAME || os.hostname()

    if (hostname) {
      options.hostname = hostname
    }
  }

  if (options.hostname) {
    options.shortHostname = options.hostname.split('.')[0]
  }

  return new EasyConfig(options)
}
