const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const pkg = require('./package.json');
const banner = require('../../banner');
const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

// Define your namespace
const NAMESPACE = 'Avati';

const entries = {
    'index': './src/index.ts',
};

const terserOptions = {
    terserOptions: {
        format: {
            comments: /@license|@preserve|^!/i,
        },
        compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            passes: 3,
            drop_console: isProduction,
            drop_debugger: isProduction,
        },
        mangle: {
            properties: {
                regex: /^_/,
            },
        },
    },
    extractComments: false,
};

const createBaseConfig = (format) => ({
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(__dirname, 'tsconfig.json'),
                            experimentalWatchApi: true,
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {},
    },
    optimization: {
        minimize: isProduction,
        minimizer: [new TerserPlugin(terserOptions)],
        moduleIds: 'deterministic',
        sideEffects: false,
        usedExports: true,
        concatenateModules: true,
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: banner({ pkg: pkg.name, version: pkg.version, homepage: pkg.homepage }),
            raw: true,
            entryOnly: true,
        }),
        // new webpack.DefinePlugin({
        //     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        // }),
    ],
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
});

const createFormatConfig = (format) => {
    const baseConfig = createBaseConfig(format);
    const configs = [];

    Object.entries(entries).forEach(([name, entry]) => {
        const formatSpecificConfig = {
            ...baseConfig,
            name: `${format}-${name}`,
            entry: { [name]: entry },
            output: {
                path: path.resolve(__dirname, `dist/${format}`),
                filename: isProduction ? '[name].min.js' : '[name].js',
                sourceMapFilename: isProduction ? '[name].min.js.map' : '[name].js.map',
                globalObject: 'typeof self !== \'undefined\' ? self : this',
            },
        };

        // Format-specific configurations with namespace support
        switch (format) {
            case 'umd':
                formatSpecificConfig.output = {
                    ...formatSpecificConfig.output,
                    library: {
                        name: [NAMESPACE, 'Animation'],
                        type: 'umd',
                        umdNamedDefine: true,
                    },
                };
                break;

            case 'esm':
                formatSpecificConfig.output = {
                    ...formatSpecificConfig.output,
                    library: {
                        type: 'module',
                    },
                    module: true,
                    environment: {
                        module: true,
                    },
                };
                formatSpecificConfig.experiments = {
                    outputModule: true,
                };
                break;

            case 'cjs':
                formatSpecificConfig.output = {
                    ...formatSpecificConfig.output,
                    library: {
                        type: 'commonjs2',
                    },
                };
                break;
        }

        configs.push(formatSpecificConfig);

        // Create non-minified version for production
        if (isProduction) {
            const nonMinifiedConfig = {
                ...formatSpecificConfig,
                optimization: {
                    ...formatSpecificConfig.optimization,
                    minimize: false,
                },
                output: {
                    ...formatSpecificConfig.output,
                    filename: '[name].js',
                    sourceMapFilename: '[name].js.map',
                },
            };
            configs.push(nonMinifiedConfig);
        }
    });

    return configs;
};

module.exports = () => {
    return [
        ...createFormatConfig('umd'),
        ...createFormatConfig('esm'),
        ...createFormatConfig('cjs'),
    ];
};
