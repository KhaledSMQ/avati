const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const pkg = require('./package.json');
const banner = require('../../banner.js');

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

// Define entry points
const entries = {
    // Full bundle
    'index': './src/index.ts',
};

// Terser configuration for production builds
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
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
            global_defs: {
                __DEV__: false
            }
        },
        mangle: {
            properties: {
                regex: /^_/  // Mangle private properties starting with underscore
            }
        }
    },
    extractComments: false,
};

// Common webpack configuration
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
                            transpileOnly: false,
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
        alias: {}
    },
    optimization: {
        minimize: isProduction,
        minimizer: [new TerserPlugin(terserOptions)],
        moduleIds: 'deterministic',
        sideEffects: true,
        usedExports: true,
        concatenateModules: true
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: banner({ pkg: pkg.name, version: pkg.version, homepage: pkg.homepage }),
            raw: true,
            entryOnly: true,
        })
    ],
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    },
    performance: {
        hints: isProduction ? 'warning' : false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
});

// Create specific configuration for each format
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
                filename: '[name].js', // This will preserve directory structure
                globalObject: 'typeof self !== \'undefined\' ? self : this',
            },
        };

        // Format-specific configurations
        switch (format) {
            case 'umd':
                formatSpecificConfig.output = {
                    ...formatSpecificConfig.output,
                    library: {
                        name: name === 'index' ? 'Avati' : ['Avati', name.replace('/index', '')],
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
                    environment: {
                        module: false,
                    },
                };
                break;
        }

        configs.push(formatSpecificConfig);
    });

    return configs;
};
// Export configurations for all formats
module.exports = () => {
    return [
        ...createFormatConfig('umd'),
        ...createFormatConfig('esm'),
        ...createFormatConfig('cjs')
    ];
};
