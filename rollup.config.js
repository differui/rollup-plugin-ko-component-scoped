import babel from 'rollup-plugin-babel';

export default {
    entry: './src/index.js',
    plugins: [
        babel({
            sourceMap: true,
            presets: ['es2015-rollup']
        })
    ],
    format: 'cjs',
    sourceMap: true,
    dest: './dist/index.js'
};
