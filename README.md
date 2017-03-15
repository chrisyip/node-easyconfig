# EasyConfig

[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Travis CI][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url]

Easy configuration for node.js

## Install

```
npm i easyconfig
```

## Quick start

Example file structure:

```
APP_ROOT
├── config
│   ├── default.js
│   ├── development.json
│   └── production.js
└── index.js
```

`default.js`:

```js
module.exports = {
  get assetPrefix () {
    return `${this.cdn}/assets`
  }
}
```

`development.json`:

```json
{
  "cdn": "http://localhost"
}
```

`production.js`:

```js
module.exports = {
  cdn: 'https://cdn.domain.com'
}
```

`index.js`:

```js
const EasyConfig = require('easyconfig')
console.log(EasyConfig().assetPrefix)
```

```
node index.js
// print "http://localhost/assets"

NODE_ENV=production node index.js
// print "https://cdn.domain.com/assets"
```

## Usage

### Where config file stores

By default, it's `${process.cwd()}/config`.

### Loading config with `NODE_ENV`

`easyconfig` will try to load config file that matches `NODE_ENV`.

```
NODE_ENV=production node app.js
```

```js
const config = EasyConfig() // returns config/production.js
```

- If `NODE_ENV` is empty, will use `development`.
- If none of files matches `NODE_ENV`, will return data in `default` file or an empty object.

### Loading config by name

```js
const config = EasyConfig('development')
const specialConfig = EasyConfig('specialConfig')
```

### Loading config outside `config/`

```js
const config = EasyConfig({ basedir: 'path/to/config/file' })
// Or
const config = EasyConfig({
  basedir: 'path/to/config/file',
  name: 'config name'
})
```

### Loading config non-js file

You can use `easyconfig.register` to load non-js file.

`easyconfig.register(EXTNAME, FILE_LOADER)`

For example, `cson`:

```js
const cson = require('cson')
const EasyConfig = require('easyconfig')
EasyConfig.register('.cson', cson.load.bind(cson))
```

### Default config file

`easyconfig` will search for `default` file and merge it into target config file.

### Property descriptors

`easyconfig` respects property descriptor, so you can do things like this:

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
console.log(config.foo) // bar/baz
```

[npm-url]: https://npmjs.org/package/easyconfig
[npm-image]: http://img.shields.io/npm/v/easyconfig.svg
[daviddm-url]: https://david-dm.org/chrisyip/node-easyconfig
[daviddm-image]: http://img.shields.io/david/chrisyip/node-easyconfig.svg
[travis-url]: https://travis-ci.org/chrisyip/node-easyconfig
[travis-image]: http://img.shields.io/travis/chrisyip/node-easyconfig.svg
[codecov-url]: https://codecov.io/gh/chrisyip/node-easyconfig
[codecov-image]: https://img.shields.io/codecov/c/github/chrisyip/node-easyconfig.svg
