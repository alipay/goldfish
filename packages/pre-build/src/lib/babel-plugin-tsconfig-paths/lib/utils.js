exports.escapeRegExp = string => string.replace(/([.+?^${}()|[\]\\/])/g, '\\$1');
exports.isImportCall = (types, calleePath) => types.isImport(calleePath.node.callee);

const matchesPattern = (types, calleePath, pattern) => {
  const { node } = calleePath;

  if (types.isMemberExpression(node)) {
    return calleePath.matchesPattern(pattern);
  }

  if (!types.isIdentifier(node) || pattern.includes('.')) {
    return false;
  }

  const name = pattern.split('.')[0];

  return node.name === name;
};
exports.matchesTransformFn = (state, calleePath) => {
  const { transformFunctions } = state.runtimeOpts;
  return transformFunctions.some(pattern => matchesPattern(state.types, calleePath, pattern));
};

exports.cacheTsPaths = fn => {
  const cache = {};
  return (tsconfig, root) => {
    if (cache[tsconfig]) return cache[tsconfig];
    const results = fn(tsconfig, root);
    cache[tsconfig] = results;
    return results;
  };
};
exports.cacheTransformString = fn => {
  let cachedVal = null;
  return (...args) => {
    if (cachedVal !== null) return cachedVal;
    cachedVal = fn(...args);
    return cachedVal;
  };
};
exports.shouldSkipNode = (node, state) => {
  const { skipModuleResolver } = state.runtimeOpts;
  if (skipModuleResolver || state.resolverVisited.has(node)) {
    return true;
  }
  return false;
};
