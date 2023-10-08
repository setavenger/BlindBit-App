import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreenRoot, QRScannerRoot, ReceiveScreenRoot} from './SingleStacks';
import {SendDetailsRoot} from './SendStack';
import {
  IntroductionRoot,
  IntroToMnemonicRoot,
  MnemonicRoot,
  RecoveryRoot,
  VerifyMnemonicRoot,
  WelcomeRoot,
} from './NewWalletStacks';
import {SettingsRoot} from './SettingsStack';

const RootStack = createNativeStackNavigator();
const NavigationDefaultOptions = {
  stackPresentation: 'modal',
};

const Navigation = () => {
  return (
    <RootStack.Navigator
      initialRouteName="HomeScreenRoot"
      // initialRouteName="IntroductionRoot"
      screenOptions={{
        headerHideShadow: true,
        contentStyle: {
          backgroundColor: '#F5F5F5',
        },
      }}>
      {/* stacks */}
      <RootStack.Screen
        name="HomeScreenRoot"
        component={HomeScreenRoot}
        options={{...NavigationDefaultOptions, headerShown: false}}
      />
      <RootStack.Screen
        name="WelcomeRoot"
        component={WelcomeRoot}
        options={{...NavigationDefaultOptions, headerShown: false}}
      />
      <RootStack.Screen
        name="RecoveryRoot"
        component={RecoveryRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="SettingsRoot"
        component={SettingsRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="SendDetailsRoot"
        component={SendDetailsRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="ReceiveScreenRoot"
        component={ReceiveScreenRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="QRScannerRoot"
        component={QRScannerRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#000000', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="IntroductionRoot"
        component={IntroductionRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="IntroToMnemonicRoot"
        component={IntroToMnemonicRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="MnemonicRoot"
        component={MnemonicRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
      <RootStack.Screen
        name="VerifyMnemonicRoot"
        component={VerifyMnemonicRoot}
        options={{
          ...NavigationDefaultOptions,
          headerShadowVisible: false,
          // headerShown: false,
          headerStyle: {
            backgroundColor: '#F5F5F5', // todo use color theme
            height: 60, // adjust the height as per your preference
          },
          headerBackTitleVisible: false,
          headerTitle: '',
          headerTintColor: '#000000',
        }}
      />
    </RootStack.Navigator>
  );
};

export default Navigation;
