rollup-plugin-scoped
=====

Convert template and style to ES6 modules:

```js
import style form './btn.scss';
import template form './btn.tpl';

console.log(style);
console.log(template);
```

Create scoped template and style:

```js
import style form '!scoped./btn.scss';
import template form '!scoped./btn.tpl';

console.log(style);
console.log(template);
```

## Installation

```
npm install --save-dev rollup-plugin-scoped
```

## Usage

```js
import { rollup } from 'rollup';
import scoped from 'rollup-plugin-scoped';

rollup({
    entry: 'app.js',
    plugins: [
        scoped()
    ]
});
```

## License

MIT
