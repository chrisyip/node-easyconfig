'use strict'

const path = require('path')

const DEFAULT_CWD = process.cwd()
const FIXTURE_DIR = path.resolve(__dirname, '../fixtures')
const PROJECT_A_DIR = path.join(FIXTURE_DIR, 'project-a')
const PROJECT_B_DIR = path.join(FIXTURE_DIR, 'project-b')

module.exports = {
  setCWD (cwd) {
    process.chdir(typeof cwd === 'string' ? cwd : PROJECT_A_DIR)
  },

  resetCWD () {
    process.chdir(DEFAULT_CWD)
  },

  setEnv (name, value) {
    const values = {}
    const backup = {}

    if (typeof name === 'string') {
      values[name] = value
    } else {
      Object.assign(values, name)
    }

    for (const [name, value] of Object.entries(values)) {
      if (name in process.env) {
        backup[name] = process.env[name]
      }
      process.env[name] = value
    }

    return () => {
      for (const [name] of Object.entries(values)) {
        delete process.env[name]
      }

      for (const [name, value] of Object.entries(backup)) {
        process.env[name] = value
      }
    }
  },

  DEFAULT_CWD,
  FIXTURE_DIR,
  PROJECT_A_DIR,
  PROJECT_B_DIR
}
