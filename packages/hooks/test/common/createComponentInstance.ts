import Writable from './Writable';

export default function createComponentInstance(params?: { setData: (...args: any[]) => void }) {
  const componentInstance: Writable<tinyapp.IComponentInstance<any, any>> = {
    setData: params?.setData || (() => {}),
    $spliceData: () => {},
    data: {},
    props: {},
    $page: {
      setData: () => {},
      $spliceData: () => {},
      $batchedUpdates: () => {},
      data: {},
      route: '',
    },
    $id: 0,
    is: '',
  };
  return componentInstance;
}
