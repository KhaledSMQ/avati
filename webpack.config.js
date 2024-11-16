const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require('fs');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack')

// const WebpackCopyToNodeModulesPlugin = require('./scripts/webpack-copy-plugin');

// Get all package directories
const packagesDir = path.join(__dirname, 'packages');
const packages = fs.readdirSync(packagesDir)
    .filter(file => fs.statSync(path.join(packagesDir, file)).isDirectory());


// Create configuration for each package
const createPackageConfig = (packageName) => {
    const packagePath = path.join(packagesDir, packageName);
    const srcPath = path.join(packagePath, 'src');
    const packageJson = require(path.join(packagePath, 'package.json'));
    const libraryName = packageJson.name.replace('@', '').replace('/', '-');

    return {
        name: packageName,
        target: 'web',
        entry: path.join(srcPath, 'index.ts'),
        output: {
            path: path.join(packagePath, 'dist'),
            filename: 'index.js',
            library: {
                name: libraryName,
                type: 'umd',
                umdNamedDefine: true
            },
            globalObject: 'window'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    options: {
                        projectReferences: false,
                        configFile: path.resolve(__dirname, 'tsconfig.json'),
                        transpileOnly: false
                    },
                    exclude: /node_modules/
                },
                // Add CSS support
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                // Add asset support
                {
                    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    type: 'asset/resource'
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
            alias: {
                '@Avati': packagesDir
            }
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        format: {
                            comments: false,
                        },
                        compress: {
                            dead_code: true,
                            drop_console: true,
                            drop_debugger: true
                        }
                    },
                    extractComments: false,
                }),
            ],
        },
        plugins: [
            new webpack.WatchIgnorePlugin({
                paths: [
                    /\.js$/,
                    /\.d\.ts$/,
                    /\.map$/,
                ]
            }),
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['./packages/*/dist/*']
            }),
            new ForkTsCheckerWebpackPlugin(),
        ],
        devtool: 'source-map',
        stats: {
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }
    };
};

// Export webpack configuration factory
module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    // Create configs for all packages
    const configs = packages.map(packageName => {
        const config = createPackageConfig(packageName);
        // Add the copy plugin to each package's config
        // config.plugins.push(new WebpackCopyToNodeModulesPlugin());

        if (isDevelopment) {
            config.mode = 'development';
            config.optimization.minimize = false;
            config.watch = true;
        } else {
            config.mode = 'production';
        }

        return config;
    });

    return configs;
};
