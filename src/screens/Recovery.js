import React, {useContext, useEffect, useState} from 'react';
import {Alert, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import Margin20View from '../components/marginedView';
import {ContinueButton, Spacing40, SpacingVar} from '../components/general';
import {newMnemonic} from '../lib/wallet/newWallet';
import {walletFromMnemonic} from '../lib/wallet/newWallet';
import {dispatch} from '../navigation/NavigationService';
import {StackActions} from '@react-navigation/native';
import {StorageContext} from '../storage-context';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
});
const Recovery = () => {
  const {setWalletAndSave} = useContext(StorageContext);
  const [inputValues, setInputValues] = useState(Array(12).fill(''));

  const onContinuePress = async () => {
    try {
      const wallet = await walletFromMnemonic(inputValues.join(' '), false);
      await setWalletAndSave(wallet);
      console.log('created wallet');
      dispatch(StackActions.replace('Navigation'));
    } catch (e) {
      Alert.alert(e);
    }
  };

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <View style={{flex: 1, flexDirection: 'column'}}>
        <Spacing40 />
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>
            Recover a wallet from a 12 word seed phrase
          </Text>
        </View>
        <Spacing40 />
        <View>
          <Text style={styles.text}>
            Enter the words below to recover your wallet in this app
          </Text>
        </View>
        <Spacing40 />
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {Array(12)
            .fill(null)
            .map((_, index) => (
              <View
                style={{
                  width: '50%',
                  paddingVertical: 10,
                  paddingRight: index % 2 === 0 ? 5 : 0,
                  paddingLeft: index % 2 === 0 ? 0 : 5,
                }}
                key={index}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    fontSize: 20,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#D0D0D0',
                      borderTopLeftRadius: 25,
                      borderBottomLeftRadius: 25,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        padding: 10,
                        textAlign: 'center',
                        fontSize: 20,
                        height: 45,
                      }}>
                      {index + 1}
                    </Text>
                  </View>

                  <SpacingVar length={3} horizontal={true} />

                  <View
                    style={{
                      flex: 2,
                      backgroundColor: '#D0D0D0',
                      overflow: 'hidden',
                      borderTopRightRadius: 25,
                      borderBottomRightRadius: 25,
                    }}>
                    <TextInput
                      autoCapitalize={'none'}
                      autoCorrect={false}
                      style={{padding: 10, fontSize: 20, height: 45}}
                      value={inputValues[index]}
                      onChangeText={text => {
                        const updatedValues = [...inputValues];
                        updatedValues[index] = text;
                        setInputValues(updatedValues);
                      }}
                      placeholder={`Word ${index + 1}`}
                    />
                  </View>
                </View>
              </View>
            ))}
        </View>
      </View>
      <Spacing40 />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ContinueButton color={'#F7931A'} onPress={onContinuePress} />
      </View>
    </Margin20View>
  );
};

export default Recovery;
