import React, {useContext, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import Margin20View from '../components/marginedView';
import {StorageContext, LoadStates} from '../storage-context';
import {StackActions, useNavigation} from '@react-navigation/native';
import {navigate} from '../navigation/NavigationService';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  icon: {
    width: 64,
    height: 64,
  },
});

const Splash = () => {
  const {dispatch} = useNavigation();
  const {loadState, loadWallet} = useContext(StorageContext);

  // loadWallet();
  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    console.log(loadState);
    switch (loadState) {
      case LoadStates.NotLoaded:
        break;
      case LoadStates.Loaded:
        dispatch(StackActions.replace('Navigation'));
        break;
      case LoadStates.New:
        navigate('Navigation', {screen: 'WelcomeRoot'});
    }
  }, [loadState]);

  return (
    <SafeAreaView style={styles.container}>
      <Margin20View>
        <Text>Here we are</Text>
        <Text>Hello Bitcoin</Text>
      </Margin20View>
    </SafeAreaView>
  );
};

export default Splash;
