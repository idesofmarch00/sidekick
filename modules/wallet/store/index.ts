// dependencies
import {create} from 'zustand';

// utils
import createSelectors from '@/utils/selectors';

// types
import {FetchUserWalletQuery} from '@/generated/graphql';

type LoaderType = 'add-funds';

type WalletStore = {
  userWallet: FetchUserWalletQuery['wallets'][0] | null | undefined;

  //add amount
  rechargeAmount: string;

  // loaders
  walletLoaders: Record<LoaderType, boolean>;
};

type WalletActions = {
  setWallet: (
    wallet: FetchUserWalletQuery['wallets'][0] | null | undefined,
  ) => void;

  setRechargeAmount: (amt: string) => void;

  // loader actions
  startLoading: (loader: LoaderType) => void;
  stopLoading: (loader: LoaderType) => void;

  // reset store
  resetWalletStore: () => void;
};

const walletInitialState: WalletStore = {
  userWallet: null,
  rechargeAmount: '0',

  // loaders
  walletLoaders: {
    'add-funds': false,
  },
};

const walletStore = create<WalletStore & WalletActions>(set => ({
  ...walletInitialState,

  // otp flow
  setWallet: wallet =>
    set({
      userWallet: wallet,
    }),

  setRechargeAmount: amt => set({rechargeAmount: amt}),

  // Loader actions
  startLoading: (loader: LoaderType) =>
    set(state => ({
      walletLoaders: {...state.walletLoaders, [loader]: true},
    })),

  stopLoading: (loader: LoaderType) =>
    set(state => ({
      walletLoaders: {...state.walletLoaders, [loader]: false},
    })),

  resetWalletStore: () => set(walletInitialState),
}));

export default createSelectors(walletStore);
