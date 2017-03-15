'use strict'

module.exports = {
  name: 'default',

  get getter () {
    return 'getter'
  },

  get assetPrefix () {
    return `${this.cdn}/assets`
  }
}
