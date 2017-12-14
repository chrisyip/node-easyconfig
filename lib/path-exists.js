'use strict'

const fs = require('fs')

module.exports = path => {
  try {
    const stat = fs.statSync(path, fs.constants.R_OK)
    return stat.isDirectory() || stat.isFile()
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    }

    throw e
  }
}
