import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Splash from '../screens/Splash';
import RootStack from './RootStack';

const InitStack = createNativeStackNavigator();

const InitRoot = () => (
  <InitStack.Navigator
    screenOptions={{contentStyle: {backgroundColor: '#F5F5F5'}}}
    initialRouteName="SplashRoot">
    <InitStack.Screen
      name="SplashRoot"
      component={Splash}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
    <InitStack.Screen
      name={'Navigation'}
      component={RootStack}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </InitStack.Navigator>
);
export default InitRoot;
