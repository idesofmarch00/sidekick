import {useUserStore} from '@/globalStore';

export const showCredits = () => {
  const {user} = useUserStore.getState();
  console.log('user', user);

  if (user?.user_organizations?.length) {
    return true;
  }
  return false;
};
