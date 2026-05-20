// dependencies
import {
  FetchCurrentUserDocument,
  FetchCurrentUserQuery,
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '@/generated/graphql';
import {callMutation, callQuery} from '@/utils/client';

// store
import useUserStore from '../store';

const {setUser} = useUserStore.getState();

const UserService = {
  fetchUserDetails: async () => {
    const response: FetchCurrentUserQuery = await callQuery({
      queryDocument: FetchCurrentUserDocument,
      variables: {},
    });

    setUser(response.users[0]);
    return response.users[0];
  },

  updateUserDetails: async function (args: UpdateUserMutationVariables) {
    const response: UpdateUserMutation = await callMutation({
      queryDocument: UpdateUserDocument,
      variables: args,
    });

    return response.update_users_by_pk?.id;
  },
};

export default UserService;
