'use strict'

const isPlainObj = require('is-plain-obj')

module.exports = function merge (...items) {
  let index = 0

  if (items.length === 1 && Array.isArray(items[0])) {
    items = items[0]
  }

  const result = items[0]

  while (++index <= items.length) {
    const item = items[index]

    if (item == null) {
      continue
    }

    for (const key of Object.keys(item)) {
      if (isPlainObj(result[key]) && isPlainObj(item[key])) {
        result[key] = merge([result[key], item[key]])
        continue
      }

      const descriptor = Object.getOwnPropertyDescriptor(item, key)
      if (descriptor) {
        Object.defineProperty(result, key, Object.assign({}, descriptor, { configurable: true }))
      }
    }
  }

  return result
}
