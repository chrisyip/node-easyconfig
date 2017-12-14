# EasyConfig

[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Travis CI][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url]

Easy configuration for node.js, inspired by [node-config ](https://github.com/lorenwest/node-config).

## Install

```
npm i easyconfig
```

## Quick start

Example file structure:

```
.
├── config
│   ├── default.js
│   ├── development.json
│   └── production.js
└── index.js
```

```
// Default is development
node index.js
// or
NODE_ENV=production node index.js
```

## Usage

```js
require([BASEDIR, [NAME, [OPTIONS]]])
// or
require(OPTOINS)

```

Available options:

- `name`: the configuration name you want to load (same as `NODE_CONFIG_ENV`, `NODE_ENV`).
- `basedir`: if it's `null`, will use `process.cwd()`, if using `EasyConfig` in main module, just keep it empty, otherwise, pass `__dirname` to `EasyConfig`. We will explain it later.
- `instance`: same as `NODE_APP_INSTANCE`.
- `hostname`: same as `HOST`, `HOSTNAME`, `os.hostname()`.
- `subModuleMode`: enable sub module mode.


Configuration files **must** be stored in `config` folder.

### Supported Environment Variables

`EasyConfig` will use variables from `process.env` to load configuration files:

- `NODE_CONFIG_ENV`, `NODE_ENV`
- `NODE_APP_INSTANCE`
- `HOST`, `HOSTNAME`, `os.hostname()`

_Load priority is lowered from left to right._

Environment variables can be changed when needed to:

```js
require('easyconfig')(__dirname, 'production', { instance: 1 })

require('easyconfig')({
  name: 'production',
  instance: 2,
  hostname: 'example.com'
})
```

### Load Order

```
default.EXT
default-{instance}.EXT
{deployment}.EXT
{deployment}-{instance}.EXT
{short_hostname}.EXT
{short_hostname}-{instance}.EXT
{short_hostname}-{deployment}.EXT
{short_hostname}-{deployment}-{instance}.EXT
{full_hostname}.EXT
{full_hostname}-{instance}.EXT
{full_hostname}-{deployment}.EXT
{full_hostname}-{deployment}-{instance}.EXT
local.EXT
local-{instance}.EXT
local-{deployment}.EXT
local-{deployment}-{instance}.EXT
custom-environment-variables.EXT
```

`EXT` can be `cson`, `js`, `json`, `properties`, `toml`, `xml`, or `yaml`.

### How It Works


Exampla file structure:

```
.
├── mian-module
│   ├── config
│   ├── index.js
│   └── node_modules
│       └── sub-module-a
│           ├── config
│           └── index.js
└── sub-module-b
    ├── config
    └── index.js
```

#### In main module

`main-module/index.js`:

```js
const config = require('easyconfig')()

const subModuleA = require('sub-module-a')

const app = new require('koa')

app.use(subModuleA())
```

#### In sub module

For sub module, `EasyConfig` will:

- Try to determine its root dir (**which contains a `package.json` file**).
- If failed to resolve root dir, use `process.cwd()` instead.

When root dir is found,

- Load configuration files from module root dir.
- Load configuratino files from `process.cwd()`.

`sub-module-a/index.js`:

```js
// config has all the props from `sub-module-a/config` and `main-module/config`
const config = require('easyconfig')(__dirname)
```

There's two use cases that `EasyConfig` suits for:

##### Sub module has its own configuration, but needs environment variables

`sub-module-a/index.js`,

```js
const config = require('easyconfig')(__dirname)
```

`EasyConfig` will merge main module's configuration into sub modules's: `merge({}, main_module_config, sub_module_a_config)`.

In this way, you can use environment variables in sub module:


```
.
└── sub-module
    └── config
        ├── development.js
        └── production.js
```

##### Sub module has default configuration and allow parent module to configure it

In `sub-module-a/index.js`,

```js
const config = require('easyconfig')({
    basedir: __dirname,
    subModuleMode: 'fieldName'
})
```

`EasyConfig` will merge sub module's configuration with main module's: `merge({}, sub_module_a_config, main_module_config)`.

If pass a string to `subModuleMode`, `EasyConfig` will treat it as a property name, and only load value with this property name from main module.

For example, main module's config:

```js
{
    subModule: {
        port: 2345
    }
    port: 1234,
    host: 'example.com'
}
```

Sub module:

```js
const config = require('easyconfig')({ 
    basedir: __dirname,
    subModuleMode: 'subModule'
})

assert(config.port === 2345)
assert('host' in config === false)
```

#### Property Descriptor

`EasyConfig` respects property descriptor, so you can do things like this:

In `default.js`:

```js
module.exports = {
  get foo () {
    return `${this.bar}/${this.baz}`
  }
}
```

In other files:

```js
module.exports = {
  bar: 'bar',
  baz: 'baz'
}
```

```js
const config = EasyConfig()
assert(config.foo === 'bar/baz')
```

[npm-url]: https://npmjs.org/package/easyconfig
[npm-image]: http://img.shields.io/npm/v/easyconfig.svg
[daviddm-url]: https://david-dm.org/chrisyip/node-easyconfig
[daviddm-image]: http://img.shields.io/david/chrisyip/node-easyconfig.svg
[travis-url]: https://travis-ci.org/chrisyip/node-easyconfig
[travis-image]: http://img.shields.io/travis/chrisyip/node-easyconfig.svg
[codecov-url]: https://codecov.io/gh/chrisyip/node-easyconfig
[codecov-image]: https://img.shields.io/codecov/c/github/chrisyip/node-easyconfig.svg
