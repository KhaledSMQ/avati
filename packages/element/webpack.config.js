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
        'index': './src/index.ts',
    };

    return config.generateConfig(entries);
};
