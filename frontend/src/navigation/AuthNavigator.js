import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import các hằng số tên màn hình
import * as ROUTES from '../constants/routes';

// Import các component màn hình
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.LOGIN_SCREEN} // Màn hình mặc định là LoginScreen
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của StackNavigator cho các màn hình auth
      }}
    >
      <Stack.Screen
        name={ROUTES.LOGIN_SCREEN}
        component={LoginScreen}
      />
      <Stack.Screen
        name={ROUTES.REGISTER_SCREEN}
        component={RegisterScreen}
      />
      <Stack.Screen
        name={ROUTES.FORGOT_PASSWORD_SCREEN}
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;