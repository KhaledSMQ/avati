import path from 'node:path';

class DependencyGraph {
    constructor(packages, packagesDir) {
        this.packages = packages;
        this.packagesDir = packagesDir;
        this.graph = this.buildGraph();
    }

    buildGraph() {
        const graph = new Map();

        this.packages.forEach(pkg => {
            const packageJson = require(path.join(this.packagesDir, pkg, 'package.json'));
            const deps = new Set();

            // Check dependencies and devDependencies for local packages
            [...Object.keys(packageJson.dependencies || {}),
                ...Object.keys(packageJson.devDependencies || {})]
                .forEach(dep => {
                    if (dep.startsWith('@avati/')) {
                        const localPkg = dep.replace('@avati/', '');
                        if (this.packages.includes(localPkg)) {
                            deps.add(localPkg);
                        }
                    }
                });

            graph.set(pkg, deps);
        });

        return graph;
    }

    getBuildOrder() {
        const visited = new Set();
        const temp = new Set();
        const order = [];

        const visit = (pkg) => {
            if (temp.has(pkg)) {
                throw new Error(`Circular dependency detected: ${pkg}`);
            }
            if (visited.has(pkg)) return;

            temp.add(pkg);

            const deps = this.graph.get(pkg);
            deps.forEach(dep => visit(dep));

            temp.delete(pkg);
            visited.add(pkg);
            order.push(pkg);
        };

        this.packages.forEach(pkg => {
            if (!visited.has(pkg)) {
                visit(pkg);
            }
        });

        return order;
    }
}

module.exports = { DependencyGraph };
