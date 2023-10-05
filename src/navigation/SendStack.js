import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SendDetails from '../screens/Send/SendDetails';
import FeeSelection from '../screens/Send/FeeSelection';
import ReviewDetails from '../screens/Send/ReviewDetails';
import ResultPositive from '../screens/Send/ResultPositive';

const SendStack = createNativeStackNavigator();
const NavigationDefaultOptions = {
  headerShown: false,
  stackPresentation: 'modal',
};

export const SendDetailsRoot = () => {
  return (
    <SendStack.Navigator
      screenOptions={{headerHideShadow: true}}
      initialRouteName="SendDetails">
      <SendStack.Screen
        name="SendDetails"
        component={SendDetails}
        options={NavigationDefaultOptions}
      />
      <SendStack.Screen
        name="FeeSelection"
        component={FeeSelection}
        options={NavigationDefaultOptions}
      />
      <SendStack.Screen
        name="ReviewDetails"
        component={ReviewDetails}
        options={NavigationDefaultOptions}
      />
      <SendStack.Screen
        name="ResultPositive"
        component={ResultPositive}
        options={NavigationDefaultOptions}
      />
    </SendStack.Navigator>
  );
};
