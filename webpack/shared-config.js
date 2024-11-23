/*
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// shared-webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

class SharedWebpackConfig {
    constructor(options = {}) {
        this.options = {
            namespace: 'Avati',
            packagePath: process.cwd(),
            ...options,
        };

        this.pkg = require(path.resolve(this.options.packagePath, 'package.json'));
        this.banner = require(path.resolve(this.options.packagePath, '../../banner'));
        this.isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';
    }

    createModuleName(name) {
        const val = name.split('/').pop();
        return String(val.replace('-', '')).charAt(0).toUpperCase() + String(val).slice(1);
    }

    createAvatiDependency(deps) {
        if (!deps) return {};
        const onlyAvatiDeps = Object.keys(deps).filter((dep) => dep.startsWith('@avati'));
        return onlyAvatiDeps.reduce((acc, dep) => {
            const name = dep.split('/').pop();
            acc[dep] = path.resolve(this.options.packagePath, '../', `${name}`);
            return acc;
        }, {});
    }

    getTerserOptions() {
        return {
            terserOptions: {
                format: {
                    comments: /@license|@preserve|^!/i,
                },
                compress: {
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true,
                    passes: 3,
                    drop_console: this.isProduction,
                    drop_debugger: this.isProduction,
                },
                mangle: {
                    properties: {
                        regex: /^_/,
                    },
                },
            },
            extractComments: false,
        };
    }

    createBaseConfig(format, isBrowser = false) {
        return {
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    configFile: path.resolve(this.options.packagePath, 'tsconfig.json'),
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
                alias: {
                    ...this.createAvatiDependency(this.pkg.dependencies),
                },
            },
            optimization: {
                minimize: this.isProduction,
                minimizer: [new TerserPlugin(this.getTerserOptions())],
                moduleIds: 'deterministic',
                sideEffects: false,
                usedExports: true,
                concatenateModules: true,
            },
            plugins: [
                new webpack.BannerPlugin({
                    banner: this.banner({
                        pkg: this.pkg.name,
                        version: this.pkg.version,
                        homepage: this.pkg.homepage,
                    }),
                    raw: true,
                    entryOnly: true,
                }),
            ],
            mode: this.isProduction ? 'production' : 'development',
            devtool: this.isProduction ? 'source-map' : 'eval-source-map',
        };
    }

    createFormatConfig(format, entries) {
        const baseConfig = this.createBaseConfig(format, format === 'umd');
        const configs = [];

        Object.entries(entries).forEach(([name, entry]) => {
            const formatSpecificConfig = {
                ...baseConfig,
                name: `${format}-${name}`,
                entry: { [name]: entry },
                output: {
                    path: path.resolve(this.options.packagePath, `dist/${format}`),
                    filename: this.isProduction ? '[name].min.js' : '[name].js',
                    sourceMapFilename: this.isProduction ? '[name].min.js.map' : '[name].js.map',
                    globalObject: 'typeof self !== \'undefined\' ? self : this',
                },
                optimization: {
                    moduleIds: 'named',
                    chunkIds: 'named',
                },
            };

            this.applyFormatSpecificConfig(formatSpecificConfig, format, name);
            configs.push(formatSpecificConfig);

            // Create non-minified version for production
            if (this.isProduction) {
                configs.push(this.createNonMinifiedConfig(formatSpecificConfig));
            }
        });

        return configs;
    }

    applyFormatSpecificConfig(config, format, name) {
        switch (format) {
            case 'umd':
                config.output = {
                    ...config.output,
                    library: {
                        name: [this.options.namespace, this.createModuleName(this.pkg.name)],
                        type: 'umd',
                        umdNamedDefine: true,
                    },
                    auxiliaryComment: {
                        root: `Namespace safely managed for ${this.options.namespace}.${this.pkg.name}`,
                    },
                };
                break;

            case 'esm':
                config.output = {
                    ...config.output,
                    library: {
                        type: 'module',
                    },
                    module: true,
                    environment: {
                        module: true,
                    },
                };
                config.experiments = {
                    outputModule: true,
                };
                break;

            case 'cjs':
                config.output = {
                    ...config.output,
                    library: {
                        type: 'commonjs2',
                    },
                };
                break;
        }
    }

    createNonMinifiedConfig(baseConfig) {
        return {
            ...baseConfig,
            optimization: {
                ...baseConfig.optimization,
                minimize: false,
            },
            output: {
                ...baseConfig.output,
                filename: '[name].js',
                sourceMapFilename: '[name].js.map',
            },
        };
    }

    generateConfig(entries = { 'index': './src/index.ts' }) {
        return [
            ...this.createFormatConfig('umd', entries),
            ...this.createFormatConfig('esm', entries),
            ...this.createFormatConfig('cjs', entries),
        ];
    }
}

module.exports = SharedWebpackConfig;
