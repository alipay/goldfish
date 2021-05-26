export default function isDependencyListEqual(oldDeps: React.DependencyList, newDeps: React.DependencyList) {
  if (oldDeps.length !== newDeps.length) {
    return false;
  }

  for (let i = 0, il = oldDeps.length; i < il; i++) {
    if (oldDeps[i] !== newDeps[i]) {
      return false;
    }
  }

  return true;
}
