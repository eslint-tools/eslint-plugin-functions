/**
 * This is loosely based off of the func-style rule:
 * https://github.com/eslint/eslint/blob/v8.57.0/lib/rules/func-style.js
 */
import type { Rule } from 'eslint';

// Function to check if the node is at the top level of a module
function isTopLevel(node: Rule.Node) {
  const { parent } = node;
  if (
    parent.type === 'Program' ||
    parent.type === 'ExportNamedDeclaration' ||
    parent.type === 'ExportDefaultDeclaration'
  ) {
    return true;
  }
  if (
    parent.type === 'VariableDeclarator' &&
    parent.parent.type === 'VariableDeclaration'
  ) {
    return isTopLevel(parent.parent);
  }
  return false;
}

function isObjectMethod(node: Rule.Node) {
  if (node.type !== 'Property') {
    return false;
  }
  return node.kind === 'get' || node.kind === 'set' || node.method === true;
}

function isClassMethod(node: Rule.Node) {
  return node.type === 'MethodDefinition' && node.parent.type === 'ClassBody';
}

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description:
        'Enforce top-level functions to be function declarations, otherwise arrow functions',
    },
    schema: [],
    messages: {
      expectedFunctionDeclaration: 'Expected a function declaration.',
      expectedArrowFunction: 'Expected an arrow function expression.',
    },
  },

  create: (context) => {
    return {
      FunctionDeclaration(node) {
        node.parent;
        // If function declaration is not top-level, report
        if (!isTopLevel(node)) {
          context.report({ node, messageId: 'expectedArrowFunction' });
        }
      },
      FunctionExpression(node) {
        // If function expression is not a method property, report it
        if (!isObjectMethod(node.parent) && !isClassMethod(node.parent)) {
          context.report({ node, messageId: 'expectedArrowFunction' });
        }
      },
      ArrowFunctionExpression(node) {
        // If an arrow function is top-level and is not a default export, report it
        if (
          isTopLevel(node) &&
          node.parent.type !== 'ExportDefaultDeclaration'
        ) {
          context.report({ node, messageId: 'expectedFunctionDeclaration' });
        }
      },
    };
  },
};

export default rule;
