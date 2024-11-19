const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const pkg = require('./package.json');
const banner = require('../../banner.js');

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';


// Common Terser configuration
const terserOptions = {
    terserOptions: {
        format: {
            comments: /@license|@preserve|^!/i, // Preserve license comments
        },
        compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
        },
    },
    extractComments: false,
};

const common_config = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    projectReferences: true,
                    configFile: path.resolve(__dirname, 'tsconfig.json'),
                    transpileOnly: false,
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    optimization: {
        minimize: isProduction,
        minimizer: [
            new TerserPlugin(terserOptions),
        ],
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: banner({ pkg: pkg.name, version: pkg.version, homepage: pkg.homepage }),
            raw: true,
            entryOnly: true,
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
            'process.env.VERSION': JSON.stringify(pkg.version),
            __DEV__: !isProduction,
            __VERSION__: JSON.stringify(pkg.version),
            __PACKAGE_NAME__: JSON.stringify(pkg.name),
            // Add any other constants you want to use
            __TEST__: false,
            __BROWSER__: true,
            __SILENT__: process.argv.includes('--silent'),
        })
    ],
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
};

module.exports = (env, argv) => {
    return [
        // UMD build
        {
            ...common_config,
            name: 'umd',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: isProduction ? 'index.umd.min.js' : 'index.umd.js',
                library: {
                    name: 'Avati', // Global variable name
                    type: 'umd',
                    umdNamedDefine: true,
                },
                globalObject: 'typeof self !== \'undefined\' ? self : this',
            },
        },
        // ESM build
        {
            ...common_config,
            name: 'esm',
            experiments: {
                outputModule: true,
            },
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: isProduction ? 'index.esm.min.js' : 'index.esm.js',
                library: {
                    type: 'module',
                },
                module: true,
                environment: {
                    module: true,
                },
            },
            optimization: {
                ...common_config.optimization,
                moduleIds: 'named',
            },
        },
        // CommonJS build
        {
            ...common_config,
            name: 'cjs',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: isProduction ? 'index.cjs.min.js' : 'index.cjs.js',
                library: {
                    type: 'commonjs2',
                },
                environment: {
                    module: false,
                },
            },
        },
    ];
};
