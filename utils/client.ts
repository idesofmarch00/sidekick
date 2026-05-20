/**
 * A module for creating and configuring a GraphQL client using urql library.
 * The client is configured with authentication and error handling.
 * The client is then store in authStore for easy access throughout the app
 * Another reason for storing the client in the store is to delet the client when the user logs out
 * * We need to delete the client on logout to invalidate the client cache
 * * Old behaviour ( before client cache invalidation ) - getting same data for different users until app is refreshed ( client returned cached data )
 * * New behaviour - getting data for the new user after logout ( from old user ) & login with the new user ( client cache invalidated )
 * * This was done w.r.t the official documentation -
 * * https://commerce.nearform.com/open-source/urql/docs/advanced/authentication/#cache-invalidation-on-logout
 */

// dependencies
import {AnyVariables, Client, cacheExchange, fetchExchange} from 'urql';
import {authExchange} from '@urql/exchange-auth';
import auth from '@react-native-firebase/auth';

// store
import useAuthStore from '@/modules/authentication/store';

// types
import {DocumentNode} from 'graphql';

const authErrorCodes = ['invalid-headers', 'invalid-jwt'];

/**
 * this function initializes the GraphQL client with the authentication token.
 * @param authToken - The authentication token.
 * @returns The initialized GraphQL client.
 */
export const initializeClient = () => {
  const graphQlClient = new Client({
    url: 'https://supreme-mustang-86.hasura.app/v1/graphql',
    exchanges: [
      cacheExchange,
      authExchange(async utils => {
        return {
          /**
           * Adds the authentication token to the operation headers.
           * @param operation - The GraphQL operation.
           * @returns The modified operation with the added headers.
           */
          addAuthToOperation(operation) {
            return utils.appendHeaders(operation, {
              // always using current token in store so that the token is always fresh
              Authorization: `Bearer ${useAuthStore.getState().authToken}`,
            });
          },
          /**
           * Checks if the authentication error occurred in the operation.
           * @param error - The GraphQL error.
           * @param _operation - The GraphQL operation.
           * @returns True if the error is an authentication error, false otherwise.
           */
          didAuthError(error, _operation) {
            if (
              authErrorCodes.includes(
                error?.graphQLErrors[0]?.extensions?.code as string,
              )
            ) {
              return true;
            }

            return false;
          },
          /**
           * Refreshes the authentication token.
           * @returns A promise that resolves when the token is refreshed.
           */
          async refreshAuth() {
            return new Promise(resolve => {
              const unsubscribe = auth().onAuthStateChanged(async user => {
                unsubscribe();
                const refreshToken = (await user?.getIdToken()) as string;
                useAuthStore.setState(state => ({
                  ...state,
                  authToken: refreshToken,
                }));
                resolve();
              });
            });
          },
        };
      }),

      fetchExchange,
    ],
    //todo:need to fix this , to prevent default behaviour of cache first
    requestPolicy: 'network-only',
  });

  return graphQlClient;
};

/**
 * The arguments for calling a GraphQL query or mutation.
 */
type Args = {
  queryDocument: DocumentNode;
  variables: AnyVariables;
  callback?: () => void;
  errorCallback?: () => void;
};

/**
 * Calls a GraphQL query.
 * @param args - The arguments for the query.
 * @returns The query result.
 * @throws An error if the query fails.
 */
export const callQuery = async (args: Args) => {
  const graphQlClient = useAuthStore.getState().graphQLClient as Client;

  try {
    const {data, error} = await graphQlClient
      .query(args.queryDocument, {...args.variables})
      .toPromise();

    if (error) {
      if (args.errorCallback) {
        args.errorCallback();
      }

      throw new Error(error.graphQLErrors[0].message);
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to call API ${error}`);
  } finally {
    if (args.callback) {
      args.callback();
    }
  }
};

/**
 * Calls a GraphQL mutation.
 * @param args - The arguments for the mutation.
 * @returns The mutation result.
 * @throws An error if the mutation fails.
 */
export const callMutation = async (args: Args) => {
  const graphQlClient = useAuthStore.getState().graphQLClient as Client;

  try {
    const {data, error} = await graphQlClient
      .mutation(args.queryDocument, {...args.variables})
      .toPromise();

    if (error) {
      if (args.errorCallback) {
        args.errorCallback();
      }

      throw new Error(error.graphQLErrors[0].message);
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to call API ${error}`);
  } finally {
    if (args.callback) {
      args.callback();
    }
  }
};
