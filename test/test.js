'use strict'

import test from 'ava'
import path from 'path'
import EasyConfig from '..'

process.chdir(path.resolve(__dirname, './fixtures'))

test('EasyConfig', t => {
  t.is(Object.prototype.toString.call(EasyConfig), '[object Function]', 'should be a function')
  t.is(Object.prototype.toString.call(EasyConfig.register), '[object Function]', 'should have `register` function')
})

test('Loading config', t => {
  const config = EasyConfig()
  const dev = require('./fixtures/config/development')

  t.is(config.name, 'development', 'should load `development` by default')
  t.is(config.getter, 'getter', 'should merge `default`')
  t.true(config.hasOwnProperty('getter'), 'should support getter')
  t.falsy(Object.getOwnPropertyDescriptor(config, 'name').set, 'should respect property descriptor')
  t.falsy(Object.getOwnPropertyDescriptor(config, 'getter').set, 'should respect property descriptor')
  t.is(config.assetPrefix, 'http://localhost/assets')

  config.foo = 'foo'
  t.is(config.name, dev.name)
  t.not(config.foo, dev.foo)
  t.false(dev.hasOwnProperty('foo'))
})

test('Loading named config', t => {
  const a = EasyConfig('a')
  t.is(a.name, 'a')
  t.is(a.getter, 'getter', 'should merge `default`')

  const a2 = EasyConfig({ name: 'a' })
  t.is(a, a2, 'should return same object for same name')
})

test('Loading config with NODE_ENV', t => {
  const originEnv = process.env.NODE_ENV

  process.env.NODE_ENV = 'production'
  const config = EasyConfig()
  t.is(config.name, 'production')

  process.env.NODE_ENV = originEnv
})

test('Loading config in other folders', t => {
  const bar = EasyConfig({ name: 'bar', basedir: path.resolve(__dirname, './fixtures/foo') })
  t.is(bar.name, 'bar')
  t.true(bar.propFromDefault)
})

test('Loading config with new extname', t => {
  const cson = require('cson')
  EasyConfig.register('.cson', cson.load.bind(cson))

  const baz = EasyConfig({ name: 'baz', basedir: path.resolve(__dirname, './fixtures/foo') })
  t.is(baz.name, 'baz')
  t.true(baz.propFromDefault)
})
