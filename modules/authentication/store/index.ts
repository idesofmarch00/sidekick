/* eslint-disable @typescript-eslint/no-explicit-any */
// dependencies
import {create} from 'zustand';
import {Dimensions} from 'react-native';
import {BottomSheetMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {RefObject} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {Client} from 'urql';

// components
import WelcomeForm from '../components/WelcomeForm';

// utils
import createSelectors from '@/utils/selectors';
import {ViewType} from '../types';
import {FetchAllOrganisationsQuery} from '@/generated/graphql';

const {height} = Dimensions.get('window');

type LoaderType =
  | 'loading-user'
  | 'phone-verification'
  | 'user-login'
  | 'profile-update'
  | 'auth-confirmation'
  | 'otp-verification';

export type ExistingFormData = {
  phoneNumber: string;
};

export type NewUserFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

type AuthStore = {
  //organisations
  selectedOrganisation:
    | FetchAllOrganisationsQuery['organizations'][0]
    | null
    | undefined;
  organisations: FetchAllOrganisationsQuery['organizations'];

  // firebase credentials
  authUser: FirebaseAuthTypes.User | null | undefined;
  confirmationResult: FirebaseAuthTypes.ConfirmationResult | null;
  authToken: string;

  // graphql
  graphQLClient: Client | null;

  // form data
  newUserFormData: NewUserFormData;
  existingUserPhoneNumber: string;

  // bottom sheet
  AuthBottomSheetComponent: React.FC | null;
  authBottomSheetRef: RefObject<BottomSheetMethods | null> | null;
  authBottomSheetSnapPoints: any;
  currentView: ViewType;

  // loaders
  authLoaders: Record<LoaderType, boolean>;
};

type GlobalActions = {
  //organisation
  setSelectedOrganisation: (
    org: FetchAllOrganisationsQuery['organizations'][0],
  ) => void;
  setOrganisations: (orgs: FetchAllOrganisationsQuery['organizations']) => void;

  // firebase credentials
  setAuthUser: (user: FirebaseAuthTypes.User | null | undefined) => void;
  setConfirmationResult: (
    confirmationResult: FirebaseAuthTypes.ConfirmationResult | null,
  ) => void;
  setAuthToken: (token: string) => void;

  // formData
  setNewUserFormData: (key: string, value: string) => void;
  setExistingUserPhoneNumber: (value: string) => void;

  // graphql
  setGraphQLClient: (client: Client | null) => void;

  // bottom sheet actions
  setAuthBottomSheetRef: (ref: RefObject<BottomSheetMethods | null>) => void;
  setAuthBottomSheetComponent: (Component: React.FC) => void;
  setAuthBottomSheetSnapPoints: (snapPoints: any) => void;
  openAuthBottomSheet: () => void;
  setCurrentView: (view: ViewType) => void;

  // loader actions
  startLoading: (loader: LoaderType) => void;
  stopLoading: (loader: LoaderType) => void;

  // reset store
  resetAuthStore: () => void;
};

const authInitialState: AuthStore = {
  // organisations
  selectedOrganisation: null,
  organisations: [],

  // otp flow
  authUser: null,
  confirmationResult: null,
  authToken: '',

  // graphql
  graphQLClient: null,

  // form data
  newUserFormData: {
    email: '',
    fullName: '',
    phoneNumber: '',
  },

  existingUserPhoneNumber: '',

  // bottom sheet
  currentView: 'welcome',
  AuthBottomSheetComponent: WelcomeForm,
  authBottomSheetRef: null,
  authBottomSheetSnapPoints: [height * 0.45],

  // loaders
  authLoaders: {
    'loading-user': true,
    'phone-verification': false,
    'user-login': false,
    'profile-update': false,
    'auth-confirmation': false,
    'otp-verification': false,
  },
};

const authStore = create<AuthStore & GlobalActions>(set => ({
  ...authInitialState,

  // organisation
  setSelectedOrganisation: org =>
    set({
      selectedOrganisation: org,
    }),

  setOrganisations: orgs =>
    set({
      organisations: orgs,
    }),

  // otp flow
  setAuthUser: user =>
    set({
      authUser: user,
    }),

  setConfirmationResult: confirmationResult =>
    set({
      confirmationResult: confirmationResult,
    }),

  setAuthToken: token =>
    set({
      authToken: token,
    }),

  // form data
  setNewUserFormData: (key, value) =>
    set(prevState => ({
      newUserFormData: {
        ...prevState.newUserFormData,
        [key]: value,
      },
    })),

  setExistingUserPhoneNumber: value =>
    set({
      existingUserPhoneNumber: value,
    }),

  //  graphql
  setGraphQLClient: client =>
    set({
      graphQLClient: client,
    }),

  // bottom sheet actions
  setAuthBottomSheetComponent: Component =>
    set({
      AuthBottomSheetComponent: Component,
    }),

  setAuthBottomSheetSnapPoints: snapPoints =>
    set({
      authBottomSheetSnapPoints: snapPoints,
    }),

  openAuthBottomSheet: () =>
    set(state => {
      if (state.authBottomSheetRef?.current) {
        state.authBottomSheetRef.current.expand();
      }
      return {};
    }),

  setAuthBottomSheetRef: ref =>
    set({
      authBottomSheetRef: ref,
    }),

  setCurrentView: view =>
    set({
      currentView: view,
    }),

  // Loader actions
  startLoading: (loader: LoaderType) =>
    set(state => ({
      authLoaders: {...state.authLoaders, [loader]: true},
    })),

  stopLoading: (loader: LoaderType) =>
    set(state => ({
      authLoaders: {...state.authLoaders, [loader]: false},
    })),

  resetAuthStore: () =>
    set(prevState => ({
      ...authInitialState,
      authLoaders: {
        ...prevState.authLoaders,
        'loading-user': false,
      },
    })),
}));

export default createSelectors(authStore);
