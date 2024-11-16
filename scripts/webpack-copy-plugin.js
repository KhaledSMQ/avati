import copyToNodeModules from './copy-to-node-modules';

class WebpackCopyToNodeModulesPlugin {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapPromise(
            'WebpackCopyToNodeModulesPlugin',
            async (compilation) => {
                try {
                    await copyToNodeModules();
                } catch (error) {
                    compilation.errors.push(error);
                }
            },
        );
    }
}

module.exports = WebpackCopyToNodeModulesPlugin;
