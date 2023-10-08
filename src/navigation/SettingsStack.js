import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SettingsOverview from '../screens/Settings/SettingsOverview';
import TorSetting from '../screens/Settings/TorSetting';
import WalletSettingsOverview from '../screens/Settings/WalletSettings/WalletSettingsOverview';

const SettingsStack = createNativeStackNavigator();
const NavigationDefaultOptions = {
  headerShown: false,
  stackPresentation: 'modal',
};

export const SettingsRoot = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{headerHideShadow: true}}
      initialRouteName="SettingsOverview">
      <SettingsStack.Screen
        name="SettingsOverview"
        component={SettingsOverview}
        options={NavigationDefaultOptions}
      />
      <SettingsStack.Screen
        name="TorSetting"
        component={TorSetting}
        options={NavigationDefaultOptions}
      />
      <SettingsStack.Screen
        name="WalletSettingsOverview"
        component={WalletSettingsOverview}
        options={NavigationDefaultOptions}
      />
    </SettingsStack.Navigator>
  );
};
