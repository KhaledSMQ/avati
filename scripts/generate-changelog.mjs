/*
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

function getLatestTag() {
    try {
        return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
    } catch {
        return null; // Return null if no tags exist
    }
}

function getCommitsSinceTag(tag, packagePath) {
    const gitCommand = tag
        ? `git log ${tag}..HEAD --format="%H||||%s||||%b" -- ${packagePath}`
        : `git log --format="%H||||%s||||%b" -- ${packagePath}`;

    try {
        return execSync(gitCommand, { encoding: 'utf-8' })
            .split('\n')
            .filter(Boolean);
    } catch (error) {
        console.error(`Error getting commits for ${packagePath}:`, error);
        return [];
    }
}

function parseCommit(commitStr) {
    const [hash, subject, body] = commitStr.split('||||');
    const typeMatch = subject.match(/^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(([^)]+)\))?:/);

    if (!typeMatch) return null;

    const [, type, , scope] = typeMatch;
    const message = subject.slice(subject.indexOf(':') + 1).trim();
    const isBreaking = subject.includes('!') || body.includes('BREAKING CHANGE');

    return {
        hash: hash.slice(0, 7),
        type,
        scope,
        message,
        isBreaking,
        body: body.trim(),
    };
}

function formatChangelog(commits, version) {
    const changes = {
        breaking: [],
        features: [],
        fixes: [],
        other: [],
    };

    commits.forEach(commit => {
        if (!commit) return;

        const entry = `- ${commit.message} ([${commit.hash}](https://github.com/KhaledSMQ/avati/commits/${commit.hash}))` +
            (commit.body ? `\n  ${commit.body.replace(/\n/g, '\n  ')}` : '');

        if (commit.isBreaking) {
            changes.breaking.push(entry);
        } else if (commit.type === 'feat') {
            changes.features.push(entry);
        } else if (commit.type === 'fix') {
            changes.fixes.push(entry);
        } else {
            changes.other.push(entry);
        }
    });

    let content = '';

    if (version) {
        content += `\n## [${version}] - ${new Date().toISOString().split('T')[0]}\n`;
    }

    if (changes.breaking.length) {
        content += '\n### ⚠ BREAKING CHANGES\n\n' + changes.breaking.join('\n\n');
    }
    if (changes.features.length) {
        content += '\n### ✨ Features\n\n' + changes.features.join('\n\n');
    }
    if (changes.fixes.length) {
        content += '\n### 🐛 Bug Fixes\n\n' + changes.fixes.join('\n\n');
    }
    if (changes.other.length) {
        content += '\n### Other Changes\n\n' + changes.other.join('\n\n');
    }

    return content;
}

function updatePackageChangelog(packageDir, packageName) {
    const changelogPath = path.join(packageDir, 'CHANGELOG.md');
    const latestTag = getLatestTag();
    const commits = getCommitsSinceTag(latestTag, packageDir)
        .map(parseCommit)
        .filter(commit => commit && (!commit.scope || commit.scope === packageName));

    if (commits.length === 0) {
        console.log(`No new changes for ${packageName}`);
        return;
    }

    // Get package version
    const packageJsonPath = path.join(packageDir, 'package.json');
    const { version } = JSON.parse(readFileSync(new URL(packageJsonPath, import.meta.url)));

    // Read existing changelog or create new one
    let changelog = '';
    if (existsSync(changelogPath)) {
        changelog = readFileSync(changelogPath, 'utf-8');
    } else {
        changelog = `# Changelog\n\nAll notable changes to \`${packageName}\` will be documented in this file.\n`;
    }

    // Add new changes at the top (after the header)
    const newChanges = formatChangelog(commits, version);
    if (newChanges) {
        const [header, ...rest] = changelog.split('\n## ');
        changelog = [header, newChanges, ...rest].join('\n## ');
    }

    fs.writeFileSync(changelogPath, changelog);
    console.log(`Updated changelog for ${packageName}`);
}

function generateChangelogs() {
    const packagesDir = path.join(__dirname, '../packages');
    const packages = fs.readdirSync(packagesDir)
        .filter(file => fs.statSync(path.join(packagesDir, file)).isDirectory());

    packages.forEach(packageName => {
        const packageDir = path.join(packagesDir, packageName);
        updatePackageChangelog(packageDir, packageName);
    });
}

// Run the generator
generateChangelogs();
