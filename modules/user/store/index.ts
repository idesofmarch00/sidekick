// dependencies
import {create} from 'zustand';

// utils
import createSelectors from '@/utils/selectors';

// types
import {FetchCurrentUserQuery} from '@/generated/graphql';

// const {height} = Dimensions.get('window');

type LoaderType = 'update-user';

export type NewUserFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

type UserStore = {
  user: FetchCurrentUserQuery['users'][0] | null | undefined;

  // loaders
  userLoaders: Record<LoaderType, boolean>;
};

type UserActions = {
  // firebase credentials
  setUser: (user: FetchCurrentUserQuery['users'][0] | null | undefined) => void;

  // loader actions
  startLoading: (loader: LoaderType) => void;
  stopLoading: (loader: LoaderType) => void;

  // reset store
  resetUserStore: () => void;
};

const userInitialState: UserStore = {
  // otp flow
  user: null,

  // loaders
  userLoaders: {
    'update-user': false,
  },
};

const userStore = create<UserStore & UserActions>(set => ({
  ...userInitialState,

  // otp flow
  setUser: user =>
    set({
      user: user,
    }),

  // Loader actions
  startLoading: (loader: LoaderType) =>
    set(state => ({
      userLoaders: {...state.userLoaders, [loader]: true},
    })),

  stopLoading: (loader: LoaderType) =>
    set(state => ({
      userLoaders: {...state.userLoaders, [loader]: false},
    })),

  resetUserStore: () => set(userInitialState),
}));

export default createSelectors(userStore);
