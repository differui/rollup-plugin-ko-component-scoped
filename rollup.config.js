import babel from 'rollup-plugin-babel';

export default {
    entry: './src/index.js',
    plugins: [ babel({ sourceMap: true }) ],
    sourceMap: true
};
