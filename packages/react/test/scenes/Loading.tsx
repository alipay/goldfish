import * as React from 'react';
import { useSetup, useState } from '../../src';

export interface ILoadingProps {
  className?: string;
  theme?: 'blue' | 'white';
}

const useData = () => {
  const state = useState<{
    display: boolean;
    blocks: number[];
    test1: null | number;
    test2: null | number;
    test3: null | number;
  }>({
    display: false,
    blocks: [],
    test1: null,
    test2: null,
    test3: null,
  });

  setTimeout(async () => {
    state.display = true;
    await Promise.all([
      new Promise(resolve => {
        setTimeout(() => {
          state.test1 = 1;
          resolve(undefined);
        }, 200);
      }),
      new Promise(resolve => {
        state.test2 = 1;
        resolve(undefined);
      }),
      new Promise(resolve => {
        state.test3 = 1;
        resolve(undefined);
      }),
    ]);

    state.blocks = [1, 2, 3];
  }, 200);

  return {
    state,
  };
};

export default function Loading(props: ILoadingProps) {
  const { connect } = useSetup(React, useData, props);
  return connect(({ state }) => {
    const renderBlocks = () => {
      return (
        <React.Fragment>
          {state.blocks.map((value, index) => {
            return <div key={index}>{value}</div>;
          })}
        </React.Fragment>
      );
    };
    const renderLayout = () => {
      if (state.test1 || state.test2 || state.test3) {
        if (state.test1 && state.test2 && state.test3) {
          return <div>{renderBlocks()}</div>;
        } else {
          return <div>asdf</div>;
        }
      } else {
        return 'state.test1';
      }
    };

    return <React.Fragment>{state.display && renderLayout()}</React.Fragment>;
  });
}
