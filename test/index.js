import test form 'ava';
import rollup from 'rollup';
import scoped from '..';
import sass from 'rollup-plugin-sass';
import string from 'rollup-plugin-string';

test(t => {
    return rollup({
        entry: './samples/scoped/main.js',
        plugins: [
            scoped()
        ]
    }).then(bundle => {
        const code = bundle.generate().code;

        console.log(code);
    })
});

test(t => {
    return rollup({
        entry: './samples/unscoped/main.js',
        plugins: [
            scoped(),
            sass(),
            string({ extensions: ['.tpl', '.html'] })
        ]
    }).then(bundle => {
        const code = bundle.generate().code;

        console.log(code);
    })
});
