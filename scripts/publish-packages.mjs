import { dirname, join } from 'node:path';
import { readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory


async function publishPackages() {
    const packagesDir = join(__dirname, '../packages');
    const packages = readdirSync(packagesDir)
        .filter(file => statSync(join(packagesDir, file)).isDirectory());

    for (const pkg of packages) {
        const distDir = join(packagesDir, pkg, 'dist');

        try {
            console.log(`Publishing ${pkg}...`);
            execSync('npm publish --access public', {
                cwd: distDir,
                stdio: 'inherit'
            });
            console.log(`Successfully published ${pkg}`);
        } catch (error) {
            console.error(`Failed to publish ${pkg}:`, error);
            process.exit(1);
        }
    }
}

publishPackages().catch(console.error);
