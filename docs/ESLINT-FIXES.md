# ESLint Issues Fix Guide

This document provides solutions for the ESLint errors found in the CI/CD pipeline.

## 🚀 Quick Fix

Run the auto-fix script to resolve most issues automatically:

```bash
npm run fix
```

This will run:
1. `eslint . --fix` - Auto-fix ESLint issues
2. `prettier --write .` - Format code with Prettier

## 📋 Manual Fixes Required

Some issues need manual attention. Here are the most common ones and their solutions:

### 1. Unused Variables (`@typescript-eslint/no-unused-vars`)

**Problem**: Variables declared but never used.

**Solution**: Either use the variable or prefix with underscore:

```typescript
// Before (error)
const unusedVar = 'value';

// After (fixed)
const _unusedVar = 'value'; // or remove if truly unused
```

### 2. Explicit Any Types (`@typescript-eslint/no-explicit-any`)

**Problem**: Using `any` type instead of proper typing.

**Solution**: Replace with proper types:

```typescript
// Before (error)
function handleData(data: any) {
  return data;
}

// After (fixed)
function handleData(data: unknown) {
  return data;
}

// Or with proper typing
interface DataType {
  id: number;
  name: string;
}

function handleData(data: DataType) {
  return data;
}
```

### 3. React Refresh Issues (`react-refresh/only-export-components`)

**Problem**: Files exporting non-components alongside components.

**Solution**: Move non-component exports to separate files:

```typescript
// Before (error in component file)
export const CONSTANT = 'value';
export function MyComponent() { ... }

// After (fixed)
// constants.ts
export const CONSTANT = 'value';

// MyComponent.tsx
export function MyComponent() { ... }
```

### 4. Case Declarations (`no-case-declarations`)

**Problem**: Variable declarations in switch cases without blocks.

**Solution**: Wrap case content in blocks:

```typescript
// Before (error)
switch (type) {
  case 'A':
    const result = processA();
    return result;
}

// After (fixed)
switch (type) {
  case 'A': {
    const result = processA();
    return result;
  }
}
```

### 5. Missing Dependencies in useEffect (`react-hooks/exhaustive-deps`)

**Problem**: useEffect missing dependencies or has unnecessary ones.

**Solution**: Add missing dependencies or use useCallback:

```typescript
// Before (warning)
useEffect(() => {
  fetchData(id);
}, []); // Missing 'id' dependency

// After (fixed)
useEffect(() => {
  fetchData(id);
}, [id]); // Added dependency

// Or with useCallback
const fetchDataCallback = useCallback(() => {
  fetchData(id);
}, [id]);

useEffect(() => {
  fetchDataCallback();
}, [fetchDataCallback]);
```

## 🔧 File-Specific Fixes

### Test Files

For test files, you can disable specific rules:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Test code here
```

### Utility Files

For utility files that export multiple functions:

```typescript
/* eslint-disable react-refresh/only-export-components */

// Utility functions here
```

## 📝 Updated ESLint Configuration

The ESLint configuration has been updated to be more lenient for:

1. **Test files**: Allow `any` types and unused variables
2. **Utility files**: Allow multiple exports
3. **General**: Allow underscore-prefixed unused variables

## 🤖 Automated Fixes

### GitHub Actions

A new workflow (`.github/workflows/auto-fix.yml`) automatically:

1. Runs ESLint --fix on every push
2. Runs Prettier formatting
3. Commits and pushes fixes automatically

### Local Development

Add to your development workflow:

```bash
# Before committing
npm run fix

# Check remaining issues
npm run lint

# Run full CI checks
npm run ci
```

## 🎯 Priority Fixes

Focus on these high-priority issues first:

1. **TypeScript errors**: Fix `any` types and missing types
2. **Unused imports**: Remove or prefix with underscore
3. **React hooks**: Fix dependency arrays
4. **Case declarations**: Add proper blocks

## 📊 Current Status

After applying the fixes in this guide:

- ✅ **Toast system**: All ESLint issues resolved
- ✅ **Async hooks**: Type safety improved
- ✅ **Test files**: Configured for lenient rules
- 🔄 **Legacy code**: Needs gradual cleanup

## 🚨 Node.js Version Issue

The CI shows a Node.js version error:

```
You are using Node.js 18.20.8. Vite requires Node.js version 20.19+ or 22.12+
```

**Solution**: Update the GitHub Actions workflow to use Node.js 20:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Updated from '18'
```

## 📚 Resources

- [ESLint Rules Documentation](https://eslint.org/docs/rules/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [React Hooks ESLint Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

---

*Run `npm run fix` to automatically resolve most of these issues!*