import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Margin20View} from '../../components/marginedView';
import {
  ContinueButton,
  Spacing05,
  Spacing10,
  Spacing20,
  Spacing40,
  SpacingVar,
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
    fontSize: 30,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
});
const IntroToMnemonic = () => {
  const onContinuePress = () => {
    navigate('MnemonicRoot', {screen: 'Mnemonic'});
  };

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>
            First, let's create your recovery phrase
          </Text>
        </View>
        <SpacingVar length={80} />
        <View style={{flex: 1}}>
          <Text style={styles.text}>
            A recovery phrase is a series of 12 words in a specific order. This
            word combination is unique to your wallet. Make sure to have pen and
            paper ready so you can write it down.
          </Text>
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ContinueButton color={'#F7931A'} onPress={onContinuePress} />
      </View>
    </Margin20View>
  );
};

export default IntroToMnemonic;
