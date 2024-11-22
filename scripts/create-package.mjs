#!/usr/bin/env node

/*
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { resolve, join } from 'path';
import { mkdir, cp, readFile, writeFile, access } from 'fs/promises';
import { createInterface } from 'readline';
import { argv, exit, stdin, stdout } from 'process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = createInterface({
    input: stdin,
    output: stdout
});

const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
};

const TEMPLATES = {
    'vanilla-ts': {
        name: 'Vanilla TypeScript',
        path: join(__dirname, 'templates/vanilla-ts')
    },
    'tsx': {
        name: 'TSX TypeScript',
        path: join(__dirname, 'templates/tsx')
    }
};

async function validatePackageName(name) {
    if (name.length < 1) {
        return 'Package name cannot be empty';
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
        return 'Package name can only contain lowercase letters, numbers, and hyphens';
    }
    return true;
}

async function copyDirectory(src, dest) {
    try {
        await cp(src, dest, { recursive: true });
    } catch (error) {
        console.error(`Error copying directory: ${error}`);
        exit(1);
    }
}

async function updatePackageJson(packagePath, packageName) {
    try {
        const packageJsonPath = join(packagePath, 'package.json');
        const content = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        packageJson.name = `@avatijs/${packageName}`;
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
        console.error(`Error updating package.json: ${error}`);
        exit(1);
    }
}

async function updateReadme(packagePath, packageName) {
    try {
        const readmePath = join(packagePath, 'README.md');
        const content = await readFile(readmePath, 'utf-8');
        let updatedContent = content.replace(/{{package_name}}/g, packageName)
          updatedContent = updatedContent.replace(/{{npm_package_name}}/g, packageName.replace(/s+/g, '_'));
        await writeFile(readmePath, updatedContent);
    } catch (error) {
        console.error(`Error updating README.md: ${error}`);
        exit(1);
    }
}


async function createPackage() {
    try {
        // Get package name
        let packageName = '';
        let isValidName = false;

        while (!isValidName) {
            packageName = await question('Package name: ');
            const validationResult = await validatePackageName(packageName);

            if (validationResult === true) {
                isValidName = true;
            } else {
                console.error(`Error: ${validationResult}`);
            }
        }

        // Select template
        console.log('\nAvailable templates:');
        Object.entries(TEMPLATES).forEach(([key, value], index) => {
            console.log(`${index + 1}. ${value.name}`);
        });

        const templateChoice = await question('\nSelect template (1 or 2): ');
        const templateIndex = parseInt(templateChoice) - 1;
        const templateKeys = Object.keys(TEMPLATES);
        const selectedTemplate = templateKeys[templateIndex];

        if (!selectedTemplate || !TEMPLATES[selectedTemplate]) {
            console.error('Invalid template selection');
            exit(1);
        }

        const packagePath = join(process.cwd(), 'packages', packageName);

        // Check if package already exists
        try {
            await access(packagePath);
            console.error(`Error: Package ${packageName} already exists!`);
            exit(1);
        } catch {
            // Package doesn't exist, we can proceed
        }

        // Create package directory
        await mkdir(packagePath, { recursive: true });

        // Copy template files
        await copyDirectory(TEMPLATES[selectedTemplate].path, packagePath);

        // Update package.json
        await updatePackageJson(packagePath, packageName);

        // Update README.md
        await updateReadme(packagePath, packageName);

        console.log(`\nPackage ${packageName} created successfully!`);
        console.log('\nNext steps:');
        console.log(`1. yarn install`);

    } catch (error) {
        console.error('Error creating package:', error);
        exit(1);
    } finally {
        rl.close();
    }
}

// Handle CLI arguments
if (argv[2] === 'create') {
    createPackage();
} else {
    console.log('Usage: create-package create');
    exit(1);
}
