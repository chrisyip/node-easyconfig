'use strict'

const path = require('path')
const fs = require('fs')
const assert = require('assert')
const toml = require('toml')
const yaml = require('js-yaml')
const cson = require('cson')
const X2JS = require('x2js')
const properties = require('properties')

const x2js = new X2JS()

const parsers = {
  toml (content) {
    return toml.parse(content)
  },

  yaml (content) {
    return yaml.safeLoad(content)
  },

  yml (content) {
    return yaml.safeLoad(content)
  },

  cson (content) {
    return cson.parse(content)
  },

  coffee (content) {
    return cson.parseCSString(content)
  },

  xml (content) {
    let config = x2js.xml2js(content.toString())
    const keys = Object.keys(config)

    if (keys.length === 1 && keys[0] === 'config') {
      config = config[keys[0]]
    }

    return config
  },

  properties (content) {
    return properties.parse(content)
  }
}

module.exports = {
  extensions: Object.keys(parsers),

  parse (filePath) {
    const ext = path.extname(filePath).replace('.', '')

    if (/^(js|json)$/i.test(ext)) {
      return require(filePath)
    }

    const parser = parsers[ext]

    assert(typeof parser === 'function', `Unknown configuration file format: ".${ext}"`)

    return parser(fs.readFileSync(filePath))
  }
}
