/** @type {import('@jest/types').Config.InitialOptions} */
const sharedConfig = require('../../jest.config.js');
module.exports = {
    ...sharedConfig,
    displayName: 'throttle',
    'rootDir': '../../',
}
