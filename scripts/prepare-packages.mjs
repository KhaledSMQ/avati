import path from 'node:path';
import { readdirSync, statSync} from 'node:fs';
import { writeJson, copy } from 'fs-extra';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


async function preparePackages() {
    const packagesDir = path.join(__dirname, '../packages');
    const packages = readdirSync(packagesDir)
        .filter(file => statSync(path.join(packagesDir, file)).isDirectory());

    for (const pkg of packages) {
        const packageDir = path.join(packagesDir, pkg);
        const distDir = path.join(packageDir, 'dist');

        // Copy package.json with modified content
        const packageJson = require(path.join(packageDir, 'package.json'));
        const publishPackageJson = {
            ...packageJson,
            main: 'index.js',
            types: 'index.d.ts',
            files: [
                "*.js",
                "*.d.ts",
                "*.js.map",
                "README.md",
                "LICENSE"
            ],
            scripts: undefined, // Remove scripts from published package
            devDependencies: undefined // Remove devDependencies from published package
        };

        await writeJson(path.join(distDir, 'package.json'), publishPackageJson, { spaces: 2 });

        // Copy README and LICENSE
        await copy(path.join(packageDir, 'README.md'), path.join(distDir, 'README.md'));
        await copy(path.join(__dirname, '../LICENSE'), path.join(distDir, 'LICENSE'));

        console.log(`Prepared ${pkg} for publishing`);
    }
}

preparePackages().catch(console.error);
