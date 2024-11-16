import path from 'node:path';
import chalk from 'chalk';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { copy, ensureDir } from 'fs-extra';

async function copyToNodeModules() {
    const packagesDir = path.join(__dirname, '../packages');
    const nodeModulesDir = path.join(__dirname, '../node_modules');

    // Get all package directories
    const packages = readdirSync(packagesDir)
        .filter(file => statSync(path.join(packagesDir, file)).isDirectory());

    console.log(chalk.cyan('\nCopying built packages to node_modules...\n'));

    for (const pkg of packages) {
        const packagePath = path.join(packagesDir, pkg);
        const packageJson = require(path.join(packagePath, 'package.json'));
        const packageName = packageJson.name; // This will be like @ui-lib/core

        const sourceDir = path.join(packagePath, 'dist');
        const targetDir = path.join(nodeModulesDir, ...packageName.split('/'));

        try {
            // Check if dist directory exists
            if (!existsSync(sourceDir)) {
                console.log(chalk.yellow(`⚠️  No dist folder found for ${packageName}, skipping...`));
                continue;
            }

            // Ensure target directory exists
            await ensureDir(targetDir);

            // Copy dist contents to node_modules
            await copy(sourceDir, targetDir, {
                overwrite: true,
                filter: () => {
                    // Optional: Add any filters for files you don't want to copy
                    return true;
                },
            });

            // Copy package.json (optional but recommended)
            await copy(
                path.join(packagePath, 'package.json'),
                path.join(targetDir, 'package.json'),
            );

            console.log(chalk.green(`✓ Copied ${packageName} to node_modules`));
        } catch (error) {
            console.error(chalk.red(`✗ Error copying ${packageName}:`), error);
        }
    }

    console.log(chalk.green('\n✨ All packages copied successfully!\n'));
}

// Run if called directly
if (require.main === module) {
    copyToNodeModules().catch(console.error);
}

module.exports = copyToNodeModules;
