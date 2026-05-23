// store
import {useAuthStore} from '@/globalStore';

// types
import {
  ViewType,
  AuthBottomSheetSnapPoints,
  AuthBottomSheetComponent,
} from '../types';

export const authUtils = {
  setBottomSheetView: (view: ViewType) => {
    const {
      setAuthBottomSheetComponent,
      setAuthBottomSheetSnapPoints,
      setCurrentView,
    } = useAuthStore.getState();
    setCurrentView(view);
    setAuthBottomSheetSnapPoints(AuthBottomSheetSnapPoints[view]);
    setAuthBottomSheetComponent(AuthBottomSheetComponent[view]);
  },
};
