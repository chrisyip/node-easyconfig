import test from 'ava'
import CliTest from 'command-line-test'

import env from './helpers/env'

test.afterEach(t => {
  env.resetCWD()
})

test('Load config', async t => {
  env.setCWD()

  const cliTest = new CliTest()
  const result = await cliTest.exec(`FOO=foo BAZ=baz node -e "console.log(JSON.stringify(require('./index.js').config.toJSON()))"`)
  const config = JSON.parse(result.stdout)

  t.is(config.foo, 'foo')
  t.true(typeof config.bar === 'object')
  t.is(config.bar.baz, 'baz')

  env.resetCWD()
})
