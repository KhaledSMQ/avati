const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

const common_config = {
    entry: {
        'avati': './src/index.ts',
        'avati.min': './src/index.ts',
        'jsx-runtime': './src/jsx-runtime/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/, loader: 'ts-loader',
                options: {
                    projectReferences: true,
                    configFile: path.resolve(__dirname, 'tsconfig.json'),
                    transpileOnly: false,
                },
                exclude: /node_modules/,
            }],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    optimization: {
        minimizer: [new TerserPlugin()]
    },
    plugins: [

    ],
    mode: isProduction ? 'production' : 'development',
};

module.exports = (env, argv) => {
    return [
        // UMD build
        {
            ...common_config,
            name: 'umd',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: '[name].umd.js',
                library: {
                    name: '@avati/html',
                    type: 'umd',
                }
            },
        },
        // ESM build
        {
            ...common_config,
            name: 'esm',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: '[name].esm.js',
                library: {
                    type: 'module',
                },
            },
            experiments: {
                outputModule: true,
            },
        },
        // CommonJS build
        {
            ...common_config,
            name: 'cjs',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: '[name].cjs.js',
                library: {
                    type: 'commonjs2',
                },
            },
        },
    ];
};
