import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import Margin20View from '../../components/marginedView';
import {
  ContinueButton,
  Spacing20,
  Spacing40,
  SpacingVar,
  WideButton,
} from '../../components/general';
import {navigate} from '../../navigation/NavigationService';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 35,
    fontWeight: 'bold',
  },
  subTitle: {
    textAlign: 'center',
    fontSize: 25,
  },

  text: {
    fontSize: 20,
  },
});
const Welcome = () => {
  const goToWalletNewWallet = () => {
    navigate('IntroductionRoot', {screen: 'Introduction'});
  };

  const goToWalletRecovery = () => {
    navigate('RecoveryRoot', {screen: 'Recovery'});
  };

  return (
    <Margin20View
      style={{
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        {/*<Spacing20 />*/}
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>Blind Bit</Text>
        </View>
        <SpacingVar length={30} />
        <View style={{alignItems: 'center'}}>
          <Text style={styles.subTitle}>
            A wallet implementing BIP 352 silent payments
          </Text>
        </View>
        <SpacingVar length={60} />
        <ContinueButton
          text={'Create a new wallet'}
          color={'#F7931A'}
          onPress={goToWalletNewWallet}
        />
        <Spacing20 />
        <WideButton text={'Recover from seed'} onPress={goToWalletRecovery} />
        <SpacingVar length={80} />
      </View>
      <View style={{justifyContent: 'flex-end'}}>
        <Text style={{color: '#A0A0A0', textAlign: 'center'}}>
          100% Your Bitcoin, 100% open-source
        </Text>
      </View>
    </Margin20View>
  );
};

export default Welcome;
