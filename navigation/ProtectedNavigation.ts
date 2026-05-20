import {createStaticNavigation} from '@react-navigation/native';

// navigator
import ProtectedNavigator from './ProtectedNavigator';

const ProtectedNavigation = createStaticNavigation(ProtectedNavigator);

export default ProtectedNavigation;
