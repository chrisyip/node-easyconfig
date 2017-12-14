'use strict'

module.exports = {
  config: require('../../..')(),
  aMod: require('a-mod'),
  subModuleDefault: require('a-mod/sub-module-mode')(true),
  subModule: require('a-mod/sub-module-mode')('aMod'),
  linkedSubModule: require('project-b')
}
