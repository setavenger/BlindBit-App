import React, {useContext, useLayoutEffect, useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import {Margin20ViewScroll} from '../components/marginedView';
import {ContinueButton, Spacing20, SpacingVar} from '../components/general';
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
  const [isLoading, setIsLoading] = useState(false);
  // const forceUpdate = useState()[1];

  // useLayoutEffect(() => {
  //   forceUpdate(val => !val); // toggle an unused state to force render
  // }, [forceUpdate, isLoading]);

  const onContinuePress = async () => {
    console.log('pressed');
    setIsLoading(true); // <- should start overlay here
    await new Promise(resolve => setTimeout(resolve, 0)); // This ensures that the state is updated and the overlay is rendered before moving on

    try {
      const wallet = await walletFromMnemonic(inputValues.join(' '), false);
      await setWalletAndSave(wallet);
      console.log('created wallet'); // <- does start around overlay here
      setIsLoading(false); // <- overlay should be removed here
      dispatch(StackActions.replace('Navigation')); // <- overlay is still active while stack is being replaced
    } catch (e) {
      Alert.alert(e);
      setIsLoading(false);
    }
  };

  return (
    <Margin20ViewScroll
      style={{backgroundColor: '#F5F5F5'}}
      loading={isLoading}>
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>
            Recover a wallet from a 12 word seed phrase
          </Text>
        </View>
        <Spacing20 />
        <View>
          <Text style={styles.text}>
            Enter the words below to recover your wallet in this app
          </Text>
        </View>
        <Spacing20 />
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
      <Spacing20 />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ContinueButton color={'#F7931A'} onPress={onContinuePress} />
      </View>
    </Margin20ViewScroll>
  );
};

export default Recovery;
