import Context from './Context';

export default function createContextStack<C extends Context>() {
  const contextStack: C[] = [];
  return {
    push(context: C) {
      contextStack.push(context);
    },
    pop() {
      contextStack.pop();
    },
    getCurrent() {
      return contextStack[contextStack.length - 1];
    },
  };
}
