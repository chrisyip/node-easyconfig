'use strict'

const isPlainObj = require('is-plain-obj')
const assert = require('assert')
const path = require('path')
const dotProp = require('dot-prop')
const defp = require('defp')

const merge = require('./lib/merge')
const pathExists = require('./lib/path-exists')
const loadConfs = require('./lib/load-confs')

function appendSuffix (dir) {
  return path.basename(dir) === 'config' ? dir : path.join(dir, 'config')
}

function removeSuffix (dir) {
  return path.basename(dir) === 'config' ? path.dirname(dir) : dir
}

/**
 * Find root dir for a module, expecting package.json exists
 *
 * @param {String} basedir
 * @returns {String|null}
 */
function findModuleRoot (basedir) {
  while (true) {
    const dir = removeSuffix(basedir)
    const cwd = process.cwd()

    if (dir === cwd || pathExists(path.join(dir, 'package.json'))) {
      return dir
    }

    const parent = path.resolve(dir, '..')

    // If basedir is inside cwd && parent dir is outside cwd
    if (basedir.startsWith(cwd) && !parent.startsWith(cwd)) {
      return null
    }

    // Reaches root
    if (parent === dir) {
      return null
    }

    return findModuleRoot(parent)
  }
}

class EasyConfig {
  constructor (options) {
    assert(isPlainObj(options), '`options` must be an plain object')

    const { basedir, name, subModuleMode } = options

    assert(typeof options.basedir === 'string' && options.basedir.trim(), '`basedir` requires a string')
    assert(typeof options.name === 'string' && options.name.trim(), '`name` requires a string')

    const moduleRoot = findModuleRoot(basedir)

    assert(moduleRoot, `Can't find module root for "${basedir}", please make sure "package.json" exists`)

    const configPath = appendSuffix(moduleRoot)

    const loadedFiles = []
    let confs = []

    if (pathExists(configPath)) {
      confs = loadConfs(configPath, name, options).map(conf => {
        loadedFiles.push({
          name: conf.name,
          path: conf.path
        })
        return conf.value
      })
    }

    let defaultConfig

    if (moduleRoot !== process.cwd()) {
      defaultConfig = new EasyConfig(Object.assign(options, { basedir: process.cwd() }))
    }

    if (subModuleMode) {
      if (typeof subModuleMode === 'string') {
        merge(this, ...confs, dotProp.get(defaultConfig, subModuleMode))
      } else {
        merge(this, ...confs, defaultConfig)
      }
    } else {
      merge(this, defaultConfig, ...confs)
    }

    const util = {
      name,
      dir: configPath,
      loadedFiles
    }

    defp(this, '__util__', util)
    defp(this, 'util', util, 'cw')

    return this
  }

  get (key) {
    return dotProp(this, key)
  }

  has (key) {
    return dotProp(this, key)
  }

  toJSON () {
    const result = {}

    for (const [key, value] of Object.entries(this)) {
      if (value instanceof EasyConfig) {
        result[key] = value.toObject()
        continue
      }

      if (typeof value === 'function') {
        continue
      }

      result[key] = value
    }

    return result
  }
}

module.exports = EasyConfig
