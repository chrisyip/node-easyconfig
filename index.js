'use strict'

const path = require('path')
const requere = require('requere')
const uniq = require('array-uniq')
const isPlainObj = require('is-plain-obj')

const configs = new Map()

function config (options) {
  let name, basedir

  if (options != null) {
    if (typeof options === 'string') {
      name = options
    } else if (isPlainObj(options)) {
      if (typeof options.name === 'string') {
        name = options.name
      }

      if (typeof options.basedir === 'string') {
        basedir = options.basedir
      }
    }
  }

  if (!name) {
    name = process.env.NODE_ENV || 'development'
  }

  if (!basedir) {
    basedir = path.resolve(process.cwd(), 'config')
  }

  const configPath = path.resolve(basedir, `+(default|${name}).*`)

  if (configs.has(configPath)) {
    return configs.get(configPath)
  }

  const conf = {}
  const resolved = requere(configPath, true)

  let confs = []

  for (const filePath of Object.keys(resolved)) {
    const name = path.basename(filePath, path.extname(filePath))

    if (name === 'default') {
      confs = [resolved[filePath]].concat(confs)
    } else {
      confs.push(resolved[filePath])
    }
  }

  let props = []

  for (const conf of confs) {
    props = props.concat(Object.keys(conf))
  }

  props = uniq(props)
  const len = confs.length

  for (const prop of props) {
    let index = len

    while (index--) {
      const c = confs[index]
      const descriptor = Object.getOwnPropertyDescriptor(c, prop)
      if (descriptor) {
        Object.defineProperty(conf, prop, descriptor)
        break
      }
    }
  }

  configs.set(configPath, conf)

  return conf
}

config.register = requere.register

module.exports = config
