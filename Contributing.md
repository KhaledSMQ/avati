# Contributing Guidelines

Thank you for considering contributing to our UI Library! This guide will help you understand our development process, standards, and workflows.

## Table of Contents

-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Development Setup](#development-setup)
    -   [Project Structure](#project-structure)
-   [Development Workflow](#development-workflow)
    -   [Local Development](#local-development)
    -   [Package Development](#package-development)
    -   [Building and Testing](#building-and-testing)
-   [Code Standards](#code-standards)
    -   [TypeScript Guidelines](#typescript-guidelines)
    -   [Component Guidelines](#component-guidelines)
    -   [Testing Standards](#testing-standards)
    -   [Documentation Requirements](#documentation-requirements)
-   [Git Workflow](#git-workflow)
    -   [Branch Strategy](#branch-strategy)
    -   [Commit Standards](#commit-standards)
    -   [Pull Requests](#pull-requests)
-   [Release Process](#release-process)
-   [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

-   Node.js (v20 or higher)
-   yarn (v3 or higher)
-   Git
-   A code editor with TypeScript support (we recommend WebStorm or VSCode)

### Development Setup

1. **Fork & Clone**

```bash
git clone https://github.com/KhaledSMQ/avati
cd avati
```

2. **Install Dependencies**

```bash
yarn install
```

3. **VSCode Setup**
   Install recommended extensions:

-   ESLint
-   Prettier
-   TypeScript and TSLint
-   Jest Runner

### Project Structure

```
avati/
├── packages/              # Package directory
├── scripts/              # Build and maintenance scripts
├── docs/                # Documentation
└── package.json         # Root package.json
```

## Development Workflow

### Local Development

1. **Start Development Server**

```bash
yarn run dev
```

2. **Watch Mode with Type Checking**

```bash
yarn run dev:types
```

3. **Testing During Development**

```bash
yarn run test
```

### Package Development

When creating a new package:

1. **Create Package Structure**

```bash
yarn run create-package package-name
```

2. **Package Requirements**

-   `README.md` with:
    -   Package description
    -   Installation instructions
    -   Usage examples
    -   API documentation
-   `CHANGELOG.md`
-   `package.json` with proper metadata
-   TypeScript configuration
-   Test setup

### Building and Testing

```bash
# Full build
npm run build

# Test single package
npm run test --workspace=@avati/package-name

# Test coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Code Standards

### TypeScript Guidelines

1. **Type Safety**

```typescript
// ✅ Good
interface ButtonProps {
    variant: 'primary' | 'secondary';
    onClick: (event: React.MouseEvent) => void;
}

// ❌ Bad
interface ButtonProps {
    variant: string;
    onClick: any;
}
```

2. **Use TypeScript Features**

```typescript
// ✅ Good
type Theme = 'light' | 'dark';
type Size = 'sm' | 'md' | 'lg';

// ❌ Bad
const theme: string = 'light';
```

3. **Documentation**

```typescript
/**
 * Button component props
 * @property {string} variant - Button style variant
 * @property {() => void} onClick - Click handler
 */
interface ButtonProps {
    variant: 'primary' | 'secondary';
    onClick: () => void;
}
```

### Component Guidelines

1. **Functional Components**

```typescript
// ✅ Good
const Button = ({ variant, children }: ButtonProps) => {
  return <button className={`btn-${variant}`}>{children}</button>;
};

// ❌ Bad
class Button extends React.Component {}
```

2. **Props Interface**

```typescript
// ✅ Good
interface Props {
    required: string;
    optional?: number;
}

// ❌ Bad
const Component = (props: any) => {};
```

3. **Default Props**

```typescript
// ✅ Good
const Button = ({ variant = 'primary' }: ButtonProps) => {};

// ❌ Bad
Button.defaultProps = {
    variant: 'primary',
};
```

### Testing Standards

1. **Test Coverage Requirements**

-   Minimum 80% coverage for new code
-   100% coverage for utilities and hooks

2. **Test Structure**

```typescript
describe('Component', () => {
    describe('rendering', () => {
        it('renders default state correctly', () => {});
        it('renders with custom props', () => {});
    });

    describe('behavior', () => {
        it('handles click events', () => {});
        it('updates state correctly', () => {});
    });
});
```

3. **Test Best Practices**

-   Test component behavior, not implementation
-   Use meaningful test descriptions
-   Group related tests
-   Mock external dependencies

## Git Workflow

### Branch Strategy

```
main
  └── develop
       ├── feature/scope-description
       ├── fix/scope-description
       └── docs/scope-description
```

### Commit Standards

1. **Commit Types**

-   `feat`: New feature
-   `fix`: Bug fix
-   `docs`: Documentation
-   `style`: Code style
-   `refactor`: Code refactoring
-   `perf`: Performance
-   `test`: Testing
-   `chore`: Maintenance

2. **Commit Format**

```
type(scope): subject

body

footer
```

3. **Examples**

```bash
feat(signal): add size variants

- Add small, medium, and large sizes
- Update documentation
- Add tests for new variants

BREAKING CHANGE: Changed size prop type
```

### Pull Requests

1. **PR Title Format**

```
type(scope): description

Example:
feat(button): add new variants
```

2. **PR Description Template**

```markdown
## Description

[Detailed description of changes]

## Type of Change

-   [ ] Bug fix
-   [ ] New feature
-   [ ] Breaking change
-   [ ] Documentation update

## Checklist

-   [ ] Tests added/updated
-   [ ] Documentation updated
-   [ ] Types updated
-   [ ] Changelogs updated
-   [ ] All checks passing

## Screenshots/Videos

[If applicable]

## Additional Notes

[Any additional information]
```

## Release Process

1. **Prepare Release**

```bash
npm run version-packages
```

2. **Review Changes**

-   Review changelogs
-   Check documentation
-   Verify tests

3. **Publish**

```bash
npm run publish-packages
```

## Troubleshooting

### Common Issues

1. **Build Failures**

```bash
npm run clean
npm install
npm run build
```

2. **Test Failures**

```bash
npm run test:debug
```

3. **Type Errors**

```bash
npm run type-check
```

### Getting Help

1. Search existing issues
2. Check troubleshooting guide
3. Create a new issue with:

-   Environment details
-   Steps to reproduce
-   Expected vs actual behavior

---

By following these guidelines, you help maintain the quality and consistency of our codebase. Thank you for contributing!
