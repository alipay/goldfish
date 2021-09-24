type View = Pick<tinyapp.IPageInstance<any>, 'setData' | '$spliceData' | '$page'> &
  Partial<Pick<tinyapp.IPageInstance<any>, '$batchedUpdates'>> & {
    $viewId?: string;
    $id?: string;
    $$isSyncDataSafe?: boolean;
  };

export default View;
