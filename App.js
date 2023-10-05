/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

import InitRoot from './src/navigation/InitStack';
import {navigationRef} from './src/navigation/NavigationService';
import {enableScreens} from 'react-native-screens';
import StorageProvider from './src/storage-context';

enableScreens();
function App() {
  return (
    <StorageProvider>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <InitRoot />
        </NavigationContainer>
      </SafeAreaProvider>
    </StorageProvider>
  );
}

export default App;
