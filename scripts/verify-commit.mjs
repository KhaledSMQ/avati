// Get commit message
import { readFileSync } from 'node:fs';
import chalk from 'chalk';

const msg = readFileSync(process.argv[2], 'utf-8').trim();

const commitRE = /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
    console.log();
    console.error(
        `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red('invalid commit message format.')}\n\n` +
        chalk.red('  Proper commit message format is required for automated changelog generation. Examples:\n\n') +
        `    ${chalk.green('feat(core): add new button component')}\n` +
        `    ${chalk.green('fix(components): resolve input focus state')}\n\n` +
        chalk.red('  See .github/CONTRIBUTING.md for more details.\n')
    );
    process.exit(1);
}
