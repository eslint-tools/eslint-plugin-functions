# eslint-plugin-functions

This plugin contains lint rules related to function declarations.

## Installation

1. Add `eslint-plugin-functions` to your devDependencies.

2. Add `functions` to the `plugins` section of your ESLint configuration.

```json
{
  "plugins": ["functions"]
}
```

3. Enable the rule(s) that you want ESLint to enforce.

```json
{
  "rules": {
    "functions/top-level-fn-decl": "warn"
  }
}
```

## Rules

There's currently just one lint rule in this package.

**top-level-fn-decl**

This rule enforces that the all top-level functions should be function declarations.

Example:

```ts
// Correct usage (no lint warning)
function foo() {
  return;
}

// Incorrect usage (raises lint warning)
const foo = () => {
  return;
};
```
