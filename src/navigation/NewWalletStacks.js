// every view is in its own stack so that the user can easily go back between the stacks

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Introduction from '../screens/NewWallet/Introduction';
import IntroToMnemonic from '../screens/NewWallet/IntroToMnemonic';
import Mnemonic from '../screens/NewWallet/Mnemonic';
import VerifyMnemonic from '../screens/NewWallet/VerifyMnemonic';
import Welcome from '../screens/NewWallet/Welcome';
import Recovery from '../screens/Recovery';

const WelcomeStack = createNativeStackNavigator();

export const WelcomeRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <WelcomeStack.Navigator
    name="WelcomeRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <WelcomeStack.Screen
      name="Welcome"
      component={Welcome}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </WelcomeStack.Navigator>
);

const RecoveryStack = createNativeStackNavigator();

export const RecoveryRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <RecoveryStack.Navigator
    name="RecoveryRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <RecoveryStack.Screen
      name="Recovery"
      component={Recovery}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </RecoveryStack.Navigator>
);

const IntroductionStack = createNativeStackNavigator();

export const IntroductionRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <IntroductionStack.Navigator
    name="IntroductionRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <IntroductionStack.Screen
      name="Introduction"
      component={Introduction}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </IntroductionStack.Navigator>
);

const IntroToMnemonicStack = createNativeStackNavigator();

export const IntroToMnemonicRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <IntroToMnemonicStack.Navigator
    name="IntroToMnemonicRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <IntroToMnemonicStack.Screen
      name="IntroToMnemonic"
      component={IntroToMnemonic}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </IntroToMnemonicStack.Navigator>
);

const MnemonicStack = createNativeStackNavigator();

export const MnemonicRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <MnemonicStack.Navigator
    name="MnemonicRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <MnemonicStack.Screen
      name="Mnemonic"
      component={Mnemonic}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </MnemonicStack.Navigator>
);

const VerifyMnemonicStack = createNativeStackNavigator();

export const VerifyMnemonicRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <VerifyMnemonicStack.Navigator
    name="VerifyMnemonicRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <VerifyMnemonicStack.Screen
      name="VerifyMnemonic"
      component={VerifyMnemonic}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </VerifyMnemonicStack.Navigator>
);
