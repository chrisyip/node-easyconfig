'use strict'

module.exports = {
  name: 'default',

  get assetPrefix () {
    return `${this.cdn}/assets`
  },

  propFromDefault: true
}
