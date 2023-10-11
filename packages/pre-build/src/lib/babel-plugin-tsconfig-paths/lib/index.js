const { getOptions } = require('./opts');
const { matchesTransformFn, isImportCall, shouldSkipNode } = require('./utils');
const { updateImportPath } = require('./resolve');

module.exports = ({ types }) => ({
  name: 'tsconfig-paths-resolver',

  pre() {
    this.types = types;
    this.runtimeOpts = getOptions(this.opts);
    this.resolverVisited = new Set();
  },

  post() {
    this.resolverVisited.clear();
  },

  visitor: {
    CallExpression: (node, state) => {
      if (shouldSkipNode(node, state)) return;

      const calleePath = node.get('callee');
      if (matchesTransformFn(state, calleePath) || isImportCall(state.types, node)) {
        state.resolverVisited.add(node);
        updateImportPath(node.get('arguments.0'), state);
      }
    },

    'ImportDeclaration|ExportDeclaration': (node, state) => {
      if (shouldSkipNode(node, state)) return;
      state.resolverVisited.add(node);

      updateImportPath(node.get('source'), state);
    },
  },
});
