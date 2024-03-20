/**
 * This is loosely based off of the func-style rule:
 * https://github.com/eslint/eslint/blob/v8.57.0/lib/rules/func-style.js
 */
import type { Rule } from 'eslint';
import type { ArrowFunctionExpression } from 'estree';

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

function convertToFnDecl(
  context: Rule.RuleContext,
  node: ArrowFunctionExpression & Rule.NodeParentExtension,
  fixer: Rule.RuleFixer,
): null | Rule.Fix {
  const { parent } = node;
  if (parent.type !== 'VariableDeclarator') {
    return null;
  }
  const identifier = parent.id;
  if (identifier.type !== 'Identifier') {
    return null;
  }
  const sourceCode = context.sourceCode;

  const typeParameters: Rule.Node | undefined = Object(node).typeParameters;
  const generics =
    typeParameters?.type === String('TSTypeParameterDeclaration')
      ? sourceCode.getText(typeParameters)
      : '';

  const params = node.params
    .map((param) => sourceCode.getText(param))
    .join(', ');
  const bodyRaw = sourceCode.getText(node.body);
  const body =
    node.body.type === 'BlockStatement' ? bodyRaw : `{ return ${bodyRaw}; }`;
  const functionName = identifier.name;

  const asyncKeyword = node.async ? 'async ' : '';

  const returnType: Rule.Node | undefined = Object(node).returnType;
  const typeAnnotation: Rule.Node | undefined = returnType
    ? Object(returnType).typeAnnotation
    : undefined;
  const returnTypeAnnotation = typeAnnotation
    ? `: ${sourceCode.getText(typeAnnotation)}`
    : '';

  const functionDeclarationCode = `${asyncKeyword}function ${functionName}${generics}(${params})${returnTypeAnnotation} ${body}`;

  return fixer.replaceText(node.parent.parent, functionDeclarationCode);
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
    fixable: 'code',
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
          context.report({
            node,
            messageId: 'expectedFunctionDeclaration',
            fix: (fixer) => convertToFnDecl(context, node, fixer),
          });
        }
      },
    };
  },
};

export default rule;
