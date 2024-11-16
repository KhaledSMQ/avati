#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';

async function init() {
    const program = new Command();

    program
        .name('create-avati-lib')
        .description('Create a new Avati library')
        .argument('[name]', 'Project name')
        .option('-t, --template <template>', 'Template to use (lib/app)', 'lib')
        .action(async (name, options) => {
            try {
                // If no name provided, prompt for it
                if (!name) {
                    const response = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'projectName',
                            message: 'What is your project named?',
                            default: 'my-avati-lib',
                        },
                    ]);
                    name = response.projectName;
                }
                if (
                    !options.template ||
                    (options.template !== 'lib' && options.template !== 'app')
                ) {
                    const response = await inquirer.prompt([
                        {
                            type: 'list',
                            name: 'template',
                            message: 'Select a template:',
                            choices: [
                                { name: 'javascript', value: 'js' },
                                { name: 'typescript_tailwind', value: 'tw' },
                                { name: 'typescript', value: 'tw' },
                            ],
                        },
                    ]);
                    options.template = response.template;
                }

                const spinner = ora('Creating project...').start();

                // Create project directory
                const projectPath = path.resolve(process.cwd(), name);
                await fs.ensureDir(projectPath);

                // Copy template files
                const templatePath = path.join(__dirname, 'templates', options.template);
                await fs.copy(templatePath, projectPath);

                // Create package.json
                const packageJson = {
                    name,
                    version: '0.1.0',
                    main: options.template === 'lib' ? 'dist/index.js' : 'src/index.ts',
                    scripts: {
                        dev: 'webpack --mode development --watch',
                        build: 'webpack --mode production',
                        test: 'jest',
                    },
                    dependencies: {
                        avati: '^0.1.0',
                    },
                    devDependencies: {
                        '@types/jest': '^29.5.0',
                        '@types/node': '^18.0.0',
                        jest: '^29.5.0',
                        'ts-jest': '^29.1.0',
                        typescript: '^5.0.0',
                        webpack: '^5.85.0',
                        'webpack-cli': '^5.1.0',
                        'ts-loader': '^9.4.0',
                    },
                };

                await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, {
                    spaces: 2,
                });

                spinner.succeed(`Created ${chalk.green(name)} at ${chalk.green(projectPath)}`);

                console.log('\nNext steps:');
                console.log(chalk.cyan(`  cd ${name}`));
                console.log(chalk.cyan('  npm install'));
                console.log(chalk.cyan('  npm run dev'));
            } catch (error) {
                console.error(chalk.red('Error creating project:'), error);
                process.exit(1);
            }
        });

    program.parse();
}

init().catch(console.error);
