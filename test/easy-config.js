import test from 'ava'
import EasyConfig from '../easy-config'

const DEFAULT_OPTIONS = {
  basedir: __dirname,
  name: 'development'
}

test('Create instance with options', t => {
  t.is(EasyConfig.name, 'EasyConfig')
  t.is(typeof EasyConfig, 'function')

  const config = new EasyConfig(DEFAULT_OPTIONS)

  t.true(config instanceof EasyConfig)
  t.is(typeof config.util, 'object')
})

test('Throw errors when options is invalid', t => {
  let error = t.throws(() => new EasyConfig())
  t.true(error.message.includes('`options` must be an plain object'))

  error = t.throws(() => new EasyConfig({}))
  t.true(error.message.includes('`basedir` requires a string'))

  error = t.throws(() => new EasyConfig({ basedir: {} }))
  t.true(error.message.includes('`basedir` requires a string'))

  error = t.throws(() => new EasyConfig({ basedir: __dirname, name: {} }))
  t.true(error.message.includes('`name` requires a string'))
})

test('Return different objects for same options', t => {
  const a = new EasyConfig({
    basedir: __dirname,
    name: 'foo'
  })
  const b = new EasyConfig({
    basedir: __dirname,
    name: 'foo'
  })

  t.not(a, b)
  t.deepEqual(a, b)
})
