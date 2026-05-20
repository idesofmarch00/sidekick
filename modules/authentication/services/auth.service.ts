// dependencies
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import axios from 'axios';

// store
import useAuthStore from '../store';
import {initializeClient} from '@/utils/client';
import {showToast} from '@/components';
import {config} from '@/config';

const {
  setConfirmationResult,
  resetAuthStore,
  stopLoading,
  setAuthUser,
  setGraphQLClient,
  setAuthToken,
  setOrganisations,
} = useAuthStore.getState();

const AuthService = {
  sendOTP: async function (phoneNumber: string, forceResend: boolean) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(
        phoneNumber,
        forceResend,
      );
      setConfirmationResult(confirmation);
      return confirmation;
    } catch (error) {
      const errorMessage = this.handleFirebaseAuthError(error);
      showToast({
        type: 'error',
        text1: errorMessage,
      });
      console.error('error sending OTP', error);
      throw new Error('Failed to send OTP');
    }
  },

  verifyOTP: async function (
    confirmation: FirebaseAuthTypes.ConfirmationResult | null,
    code: string,
    errorCallback: () => void,
  ) {
    try {
      const userCredential = await confirmation?.confirm(code);
      return userCredential?.user;
    } catch (error) {
      errorCallback();
      throw new Error('Failed to verify OTP');
    }
  },

  signOut: async function () {
    try {
      await auth().signOut();
      resetAuthStore();
    } catch (error) {
      // Toast.show({
      //   type: 'error',
      //   text1: 'Error signing out',
      //   text2: `${error}`,
      // });
      throw new Error('Failed to sign out');
    }
  },

  checkHasuraId: function (token: FirebaseAuthTypes.IdTokenResult) {
    const hasuraClaim = token?.claims['https://hasura.io/jwt/claims'];

    if (!hasuraClaim) {
      return null;
    } else {
      return {
        hasuraId: hasuraClaim['x-hasura-user-id'],
      };
    }
  },

  addHasuraClaimsViaRefreshToken: function (
    timeout: number,
    uid: string,
    role: string,
    errorCallback: () => void,
  ) {
    const {newUserFormData} = useAuthStore.getState();
    // const endpoint = 'https://sidekick-backend-279t.onrender.com/set-claims';

    return new Promise(resolve => {
      setTimeout(async () => {
        try {
          const result = await axios.post(
            // todo: this url is different for different environments and should be moved to a config file
            `${config.prodEndpoint}/set-claims`,
            {
              uid: `${uid}`,
              role: role,
              full_name: newUserFormData.fullName,
              phone_number: `+91${newUserFormData.phoneNumber}`,
              email: newUserFormData.email,
            },
          );

          resolve(result.data);
        } catch (error) {
          errorCallback();
          throw new Error('Failed to add hasura claims');
        }
      }, timeout);
    });
  },

  fireRefreshToken: async function (user: FirebaseAuthTypes.User | null) {
    //  * * this function waits for 3 seconds for the user to be added to firebase before calling refresh token
    //  * @argumnent - timeout in milliseconds, user id, callback function
    //  */
    await this.addHasuraClaimsViaRefreshToken(
      3000,
      user?.uid as string,
      'user',
      () => {
        this.signOut();
        stopLoading('loading-user');
      },
    );

    //    * * function to fetch new token
    //    * * the new token will have the hasura id in the claims
    //    * * the new token will be used to make authenticated requests to the server
    //    * * if no hasura id, call function again recursively
    //    */
    setTimeout(async () => {
      const updatedToken = await user?.getIdToken(true);
      const updatedTokenResult = await user?.getIdTokenResult(true);

      const hasuraIdExists = this.checkHasuraId(
        updatedTokenResult as FirebaseAuthTypes.IdTokenResult,
      );

      if (!hasuraIdExists?.hasuraId) {
        await this.fireRefreshToken(user);
      } else {
        // setIsNewUser(isNew);
        // initializing the graphql client with the new token and putting it in authStore
        const graphqlClient = initializeClient();
        setGraphQLClient(graphqlClient);
        // setXHasuraId(hasuraIdExists?.hasuraId);
        setAuthToken(updatedToken as string);
        setAuthUser(user);

        setTimeout(() => {
          stopLoading('loading-user');
        }, 1000);
      }
    }, 500);
  },

  fetchAllOrganistions: async function () {
    try {
      const response = await axios.get(
        'https://supreme-mustang-86.hasura.app/api/rest/fetchallorganisations',
      );
      setOrganisations(response.data.organizations);
    } catch (error) {
      console.log('error fetching orgs');
    }
  },

  handleFirebaseAuthError: function (error: any) {
    switch (error.code) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format.';

      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';

      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Try again later.';

      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Refresh and try again.';

      default:
        return error.message;
    }
  },

  checkIfUserExistsInOrg: async (args: {
    employeeId: string;
    phone: string;
    orgId: string;
  }) => {
    try {
      const response = await axios.get(
        'https://supreme-mustang-86.hasura.app/api/rest/checkuserexists',
        {
          params: {
            _eq: args.employeeId,
            _eq1: args.phone,
            _eq2: args.orgId,
          },
        },
      );

      console.log('response', response.data);

      if (response.data?.user_organizations?.length) {
        return true;
      }

      return false;
    } catch (err) {
      // @ts-ignore
      console.log('Error checking user exists', err?.message);
    }
  },
};

export default AuthService;
