'use strict'

const path = require('path')
const fs = require('fs')

const parsers = new Map()

function getParser (type) {
  if (type === 'yml') {
    type = 'yaml'
  }

  if (!parsers.has(type)) {
    parsers.set(type, createParse(type))
  }

  return parsers.get(type)
}

function createParse (type) {
  switch (type) {
    case 'toml':
      const toml = require('toml')
      return content => toml.parse(content)

    case 'yaml':
      const yaml = require('js-yaml')
      return content => yaml.safeLoad(content)

    case 'cson':
      return content => require('cson').parse(content)

    case 'coffee':
      return content => require('cson').parseCSString(content)

    case 'xml':
      const X2JS = require('x2js')
      const x2js = new X2JS()
      return content => {
        let config = x2js.xml2js(content.toString())
        const keys = Object.keys(config)

        if (keys.length === 1 && keys[0] === 'config') {
          config = config[keys[0]]
        }

        return config
      }

    case 'properties':
      const properties = require('properties')
      return content => properties.parse(content)
  }

  throw new Error(`Unsupported type: ${type}`)
}

module.exports = {
  extensions: Object.keys(parsers),

  parse (filePath) {
    const ext = path.extname(filePath).replace('.', '')

    if (/^(js|json)$/i.test(ext)) {
      return require(filePath)
    }

    return getParser(ext)(fs.readFileSync(filePath))
  }
}
