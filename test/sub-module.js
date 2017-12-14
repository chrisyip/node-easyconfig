import test from 'ava'
import path from 'path'
import fs from 'fs'

import EasyConfig from '../easy-config'

import env from './helpers/env'

test.afterEach(t => {
  env.resetCWD()
})

test('Work with sub module that under node_modules', t => {
  env.setCWD()

  const { aMod } = require('./fixtures/project-a')

  t.true(aMod instanceof EasyConfig)
  t.true(aMod.fromAMod)
  t.true(aMod.aModTestProp)
  t.is(aMod.cdn, 'http://localhost')
})

test('Work with sub module that linked to node_modules (e.g. npm link)', t => {
  env.setCWD()

  try {
    fs.unlinkSync(path.join(env.PROJECT_A_DIR, 'node_modules/project-b'))
  } catch (e) {
    if (!e || e.code !== 'ENOENT') {
      throw e
    }
  }

  fs.symlinkSync(env.PROJECT_B_DIR, path.join(env.PROJECT_A_DIR, 'node_modules/project-b'))

  const { linkedSubModule } = require('./fixtures/project-a')
  t.true(linkedSubModule instanceof EasyConfig)
  t.true(linkedSubModule.fromProjectB)
  t.falsy(linkedSubModule.propShouldNotExist)
})

test('Should override default with project config in subModuleMode', t => {
  env.setCWD()

  const { subModuleDefault, subModule } = require('./fixtures/project-a')

  t.true(subModuleDefault instanceof EasyConfig)
  t.true('cdn' in subModuleDefault)
  t.is(subModuleDefault.aMod.hello, subModule.hello)

  t.true(subModule instanceof EasyConfig)
  t.is(subModule.hello, 'world')
  t.false('cdn' in subModule)
})
