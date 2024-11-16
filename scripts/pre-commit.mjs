
import chalk from 'chalk';
import { execSync } from 'node:child_process';

const executeCommand = (command, errorMessage) => {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch  {
        console.error(chalk.red(`\n${errorMessage}\n`));
        process.exit(1);
    }
};

console.log(chalk.cyan('\nVerifying your commit...\n'));

// Run type checking
console.log(chalk.cyan('Running type check...'));
executeCommand('npm run type-check', 'Type check failed. Please fix type errors before committing.');

// Run linting
console.log(chalk.cyan('\nRunning linter...'));
executeCommand('npm run lint', 'Linting failed. Please fix lint errors before committing.');

// Run tests
console.log(chalk.cyan('\nRunning tests...'));
executeCommand('npm run test', 'Tests failed. Please fix failing tests before committing.');

console.log(chalk.green('\nAll checks passed! Proceeding with commit...\n'));
