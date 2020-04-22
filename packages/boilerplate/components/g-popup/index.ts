import { setupComponent, useState, useProps } from '@goldfishjs/composition-api';

export interface IGPopupProps {
  className: string;
  show: boolean;
  scroll: boolean;
  zIndex: number;
  title: string;
  subTitle: string;
  onClose?: (event: any) => void;
}

interface IGPopupState {
  closeCount: number;
}

Component(setupComponent<IGPopupProps>(
  {
    className: '',
    show: false,
    scroll: false,
    zIndex: 1,
    title: '',
    subTitle: '',
    onClose: undefined,
  },
  () => {
    const state = useState<IGPopupState>({
      closeCount: 0,
    });
    const props = useProps<IGPopupProps>();
    return {
      state,
      onPopupClose(event: any) {
        state.closeCount += 1; 
        if (props.onClose) {
          props.onClose(event);
        }
      },
    };
  },
));
