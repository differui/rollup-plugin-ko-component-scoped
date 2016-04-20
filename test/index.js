import test from 'ava';
import { rollup } from 'rollup';
import scoped from '..';
import sass from 'rollup-plugin-sass';
import string from 'rollup-plugin-string';

test('should create scoped style and template with given prefix', t => {
    return rollup({
        entry: './samples/scoped.js',
        plugins: [
            scoped()
        ]
    }).then(bundle => {
        const code = bundle.generate().code;
        const fn = new Function('assert', code);

        fn(t);
    })
});

test('should not create scoped style and template without given prefix', t => {
    return rollup({
        entry: './samples/unscoped.js',
        plugins: [
            scoped(),
            sass(),
            string({ extensions: ['.tpl', '.html'] })
        ]
    }).then(bundle => {
        const code = bundle.generate().code;
        const fn = new Function('assert', code);

        fn(t);
    })
});

test('should support sass', t => {
    return rollup({
        entry: './samples/sass.js',
        plugins: [
            scoped()
        ]
    }).then(bundle => {
        const code = bundle.generate().code;
        const fn = new Function('assert', code);

        fn(t);
    })
});

test('should support jade', t => {
    return rollup({
        entry: './samples/jade.js',
        plugins: [
            scoped()
        ]
    }).then(bundle => {
        const code = bundle.generate().code;
        const fn = new Function('assert', code);

        fn(t);
    })
});
