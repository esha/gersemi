[![Build Status](https://travis-ci.org/esha/gersemi.svg?branch=master)](https://travis-ci.org/esha/gersemi.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/esha/gersemi/badge.svg?branch=master)](https://coveralls.io/github/esha/gersemi?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# Using this module in other modules

Here is a quick example of how this module can be used in other modules. The [TypeScript Module Resolution Logic](https://www.typescriptlang.org/docs/handbook/module-resolution.html) makes it quite easy. The file `src/index.ts` is a [barrel](https://basarat.gitbooks.io/typescript/content/docs/tips/barrel.html) that re-exports selected exports from other files. The _package.json_ file contains `main` attribute that points to the generated `lib/index.js` file and `typings` attribute that points to the generated `lib/index.d.ts` file.

> If you are planning to have code in multiple files (which is quite natural for a NodeJS module) that users can import, make sure you update `src/index.ts` file appropriately.

Once published to _npm_ with the name `gersemi`, this module can be installed in the module in which you need it -

- To use the `GenesisBase` class in a TypeScript file -

```ts
import { GenesisBase } from "gersemi";

const service = GenesisBase.extend({ url: '/some-url' });
service().then((res) => {
    console.log('Success!', res);
});
```

- To use the `GenesisBase` class in a JavaScript file -

```js
const GenesisBase = require('gersemi').GenesisBase;

const service = GenesisBase.extend({ url: '/some-url' });
service().then((res) => {
    console.log('Success!', res);
});
```

### Release History
* 2017-10 [v0.0.1][] (development)

[v0.0.1]: https://github.com/esha/posterior/tree/0.0.1
