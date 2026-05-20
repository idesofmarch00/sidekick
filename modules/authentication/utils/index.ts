// store
import {useAuthStore} from '@/globalStore';

// types
import {
  ViewType,
  AuthBottomSheetSnapPoints,
  AuthBottomSheetComponent,
} from '../types';

const {
  setAuthBottomSheetComponent,
  setAuthBottomSheetSnapPoints,
  setCurrentView,
} = useAuthStore.getState();

export const authUtils = {
  setBottomSheetView: (view: ViewType) => {
    setCurrentView(view);
    setAuthBottomSheetSnapPoints(AuthBottomSheetSnapPoints[view]);
    setAuthBottomSheetComponent(AuthBottomSheetComponent[view]);
  },
};
