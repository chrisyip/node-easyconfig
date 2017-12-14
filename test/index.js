import test from 'ava'
import path from 'path'

import easyConfig from '..'

import env from './helpers/env'

test.afterEach(t => {
  env.resetCWD()
})

test('EasyConfig', t => {
  t.is(typeof easyConfig, 'function')
})

test('Load config', t => {
  env.setCWD()

  const { config } = require('./fixtures/project-a')

  const dev = require(`${env.PROJECT_A_DIR}/config/test`)

  t.is(config.name, 'test')
  t.true(config.hasOwnProperty('assetPrefix'))
  t.falsy(Object.getOwnPropertyDescriptor(config, 'name').set)
  t.falsy(Object.getOwnPropertyDescriptor(config, 'assetPrefix').set)
  t.is(config.assetPrefix, 'http://localhost/assets')

  config.foo = 'foo'
  t.is(config.name, dev.name)
  t.not(config.foo, dev.foo)
  t.false(dev.hasOwnProperty('foo'))

  env.resetCWD()
})

test('Load config with name', t => {
  env.setCWD()

  const a = easyConfig(path.join(env.PROJECT_A_DIR, 'config'), 'production')
  t.is(a.name, 'production')
  t.true(a.propFromDefault)

  const a2 = easyConfig({ name: 'production' })
  t.deepEqual(a, a2)
})

test('NODE_ENV should work', t => {
  env.setCWD()

  const reset = env.setEnv({
    NODE_ENV: 'production'
  })
  const config = easyConfig()
  t.is(config.name, 'production')
  reset()
})

test('NODE_CONFIG_ENV should have higher priority', t => {
  env.setCWD()

  const reset = env.setEnv({
    NODE_ENV: 'test',
    NODE_CONFIG_ENV: 'production'
  })
  const config = easyConfig()
  t.is(config.name, 'production')
  reset()
})

test('options.name should have highest priority', t => {
  env.setCWD()

  const reset = env.setEnv({
    NODE_CONFIG_ENV: 'production'
  })
  const config = easyConfig({ name: 'test' })
  t.is(config.name, 'test')
  reset()
})

test('HOSTNAME should work', t => {
  env.setCWD()

  const reset = env.setEnv({
    HOSTNAME: 'example.com'
  })
  const config = easyConfig()
  t.is(config.hostname.full, 'example.com')
  t.is(config.hostname.short, 'example')
  reset()
})

test('HOST should have higher priority', t => {
  env.setCWD()

  const reset = env.setEnv({
    HOSTNAME: 'example.com',
    HOST: 'example.co'
  })
  const config = easyConfig()
  t.is(config.hostname.full, 'example.co')
  t.is(config.hostname.short, 'example')
  reset()
})

test('options.hostname should have highest priority', t => {
  env.setCWD()

  const reset = env.setEnv({
    HOST: 'example.co'
  })
  const config = easyConfig({ hostname: 'example.com' })
  t.is(config.hostname.full, 'example.com')
  t.is(config.hostname.short, 'example')
  reset()
})

test('INSTANCE should work', t => {
  env.setCWD()

  const reset = env.setEnv({ NODE_APP_INSTANCE: '1' })
  const config = easyConfig()
  t.is(config.instance, '1')
  reset()
})

test('options.instance should have highest priority', t => {
  env.setCWD()

  const reset = env.setEnv({ NODE_APP_INSTANCE: '1' })
  const config = easyConfig({ instance: 2 })
  t.is(config.instance, '2')
  reset()
})
