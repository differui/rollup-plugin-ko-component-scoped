import babel from 'rollup-plugin-babel';

export default {
    entry: 'index.js',
    plugins: [ babel({ sourceMap: true }) ],
    sourceMap: true
};