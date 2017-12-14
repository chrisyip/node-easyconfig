'use strict'

const path = require('path')
const { findSync } = require('sagase')
const debug = require('debug')('EasyConfig')
const isPlainObj = require('is-plain-obj')

const { extensions, parse } = require('./parse')

const rExt = new RegExp(`\\.(${extensions.join('|')})$`, 'i')

function matchNames (names, path, filename, result) {
  for (let i = 0; i < names.length; i++) {
    if (names[i] === filename) {
      result[i] = path
      return true
    }
  }
}

function loadCustomEnvVariables (item) {
  const result = {}

  for (const [key, value] of Object.entries(item)) {
    if (isPlainObj(value)) {
      result[key] = loadCustomEnvVariables(value)
      continue
    }

    if (process.env[value] != null) {
      result[key] = process.env[value]
    }
  }

  return result
}

/**
 * Load config file from specified folder and sort it in the following order:
 *
 * @param {String} folder
 * @param {String} name
 * @param {Object} env
 * @returns {Object[]}
 */
function loadConfs (folder, name, env) {
  debug(`Search config files for "${name}" from ${folder}`)

  const files = findSync({
    folder,
    rExt,
    nameOnly: true,
    recursive: false
  })

  let defaultMatchers = ['default']
  let deploymentMatchers = [name]
  let localMatchers = ['local']

  let shortHostnameMatchers = [env.shortHostname]
  let hostnameMatchers = [env.hostname]

  if (env.instance) {
    defaultMatchers.push(`default-${env.instance}`)

    deploymentMatchers.push(`${name}-${env.instance}`)

    shortHostnameMatchers.push(`${env.shortHostname}-${env.instance}`)
    shortHostnameMatchers.push(`${env.shortHostname}-${name}`)
    shortHostnameMatchers.push(`${env.shortHostname}-${name}-${env.instance}`)

    hostnameMatchers.push(`${env.hostname}-${env.instance}`)
    hostnameMatchers.push(`${env.hostname}-${name}`)
    hostnameMatchers.push(`${env.hostname}-${name}-${env.instance}`)

    localMatchers.push(`local-${env.instance}`)
    localMatchers.push(`local-${name}`)
    localMatchers.push(`local-${name}-${env.instance}`)
  } else {
    shortHostnameMatchers.push(`${env.shortHostname}-${name}`)
    hostnameMatchers.push(`${env.hostname}-${name}`)

    localMatchers.push(`local-${name}`)
  }

  const matchers = [
    {
      items: defaultMatchers,
      result: []
    },
    {
      items: deploymentMatchers,
      result: []
    },
    {
      items: shortHostnameMatchers,
      result: []
    },
    {
      items: hostnameMatchers,
      result: []
    },
    {
      items: localMatchers,
      result: []
    },
    {
      items: ['custom-environment-variables'],
      result: [],
      handle: loadCustomEnvVariables
    }
  ]

  for (const file of files) {
    matchers.some(item => (
      matchNames(item.items, file, path.basename(file, path.extname(file)), item.result)
    ))
  }

  const confs = []

  for (const matcher of matchers) {
    for (let i = 0; i < matcher.items.length; i++) {
      const name = matcher.items[i]
      const result = { name }

      if (typeof matcher.result[i] === 'string') {
        result.path = matcher.result[i]
        result.value = parse(matcher.result[i])

        if (typeof matcher.handle === 'function') {
          result.value = matcher.handle(result.value)
        }
      }

      confs.push(result)
    }
  }

  return confs
}

module.exports = loadConfs
