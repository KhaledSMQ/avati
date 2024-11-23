/*
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SharedWebpackConfig = require('../../webpack/shared-config.js');

module.exports = () => {
    const config = new SharedWebpackConfig({
        namespace: 'Avati',
        packagePath: __dirname,
    });

    const entries = {
        // Full bundle
        'index': './src/index.ts',

        // Core functionality
        'core/index': './src/core/index.ts',
        'computed/index': './src/computed/index.ts',
        'async/index': './src/async/index.ts',
        'persistence/index': './src/persistence/index.ts',
        'debug/index': './src/debug/index.ts',
        'extensions/index': './src/extensions/index.ts',
    };

    return config.generateConfig(entries);
};
