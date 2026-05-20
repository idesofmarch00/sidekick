import {useUserStore} from '@/globalStore';

const {user} = useUserStore.getState();

export const showCredits = () => {
  console.log('user', user);

  if (user?.user_organizations?.length) {
    return true;
  }
  return false;
};
