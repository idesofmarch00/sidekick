//dependencies
import {createStaticNavigation} from '@react-navigation/native';

import AuthNavigator from './auth.navigator';

const AuthNavigation = createStaticNavigation(AuthNavigator);

export default AuthNavigation;
