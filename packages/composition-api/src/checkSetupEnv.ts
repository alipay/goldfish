import useContextType from './useContextType';

export type SetupEnv = 'page' | 'component' | 'app';

export default function checkSetupEnv<
  A extends SetupEnv,
  B extends Exclude<SetupEnv, A>,
  C extends Exclude<SetupEnv, A | B>,
  D extends Exclude<SetupEnv, A | B | C>
>(name: string, env: [A] | [A, B] | [A, B, C] | [A, B, C, D]) {
  const type = useContextType();

  if (env.indexOf(type as A) + 1 === 0) {
    throw new Error(`The ${name} can not be used in ${type} setup flow.`);
  }

  return type;
}
