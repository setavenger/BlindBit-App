import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Splash from '../screens/Splash';
import Home from '../screens/Home';
import Receive from '../screens/Receive';
import QRCodeScanner from '../screens/Send/QRCodeScanner';

const SplashScreenStack = createNativeStackNavigator();
export const SplashScreenRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <SplashScreenStack.Navigator
    name="SplashScreenRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <SplashScreenStack.Screen
      name="SplashScreen"
      component={Splash}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </SplashScreenStack.Navigator>
);

const HomeStack = createNativeStackNavigator();

export const HomeScreenRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <HomeStack.Navigator
    name="HomeScreenRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <HomeStack.Screen
      name="HomeScreen"
      component={Home}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </HomeStack.Navigator>
);

const ReceiveStack = createNativeStackNavigator();

export const ReceiveScreenRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <ReceiveStack.Navigator
    name="ReceiveScreenRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <ReceiveStack.Screen
      name="ReceiveScreen"
      component={Receive}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </ReceiveStack.Navigator>
);

const QRScannerStack = createNativeStackNavigator();

export const QRScannerRoot = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <QRScannerStack.Navigator
    name="QRScannerRoot"
    screenOptions={{headerShown: false}}>
    {/* eslint-disable-next-line react/react-in-jsx-scope */}
    <QRScannerStack.Screen
      name="QRScanner"
      component={QRCodeScanner}
      options={{
        headerShown: false,
        gestureEnabled: false,
        stackPresentation: 'modal',
      }}
    />
  </QRScannerStack.Navigator>
);
