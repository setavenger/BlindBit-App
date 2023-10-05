import React, {useContext, useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import Margin20View from '../../components/marginedView';
import {ContinueButton, Spacing40, SpacingVar} from '../../components/general';
import {dispatch} from '../../navigation/NavigationService';
import {
  selectThreeWordsFromMnemonic,
  walletFromMnemonic,
} from '../../lib/wallet/newWallet';
import {StackActions, useRoute} from '@react-navigation/native';
import {StorageContext} from '../../storage-context';

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
const VerifyMnemonic = () => {
  const {setWalletAndSave} = useContext(StorageContext);
  const params = useRoute().params;
  const mnemonic = params && params.mnemonic ? params.mnemonic : undefined;
  const [word1Given, setWord1Given] = useState('');
  const [word2Given, setWord2Given] = useState('');
  const [word3Given, setWord3Given] = useState('');
  const [words, setWords] = useState(undefined);

  const onContinuePress = async () => {
    // navigate('HomeScreenRoot', {screen: 'HomeScreen'});
    const wallet = await walletFromMnemonic(mnemonic.join(' '));
    await setWalletAndSave(wallet);
    console.log('created wallet');
    dispatch(StackActions.replace('Navigation'));
  };

  useEffect(() => {
    if (!mnemonic) {
      Alert.alert('Setup Error', 'Mnemonic could not be passed');
    }
    setWords(selectThreeWordsFromMnemonic(mnemonic));
  }, [mnemonic]);

  useEffect(() => {
    console.log(words);
  }, [words]);

  const renderWord = (index, word, wordGiven, setWord) => {
    return (
      <View style={{flexDirection: 'row', padding: 15, alignItems: 'center'}}>
        <View style={{flex: 1}}>
          <Text style={{fontSize: 20}}>{index}</Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            flex: 8,
            borderWidth: 0.7,
            padding: 10,
            height: 40,
            borderColor:
              wordGiven !== ''
                ? word === wordGiven
                  ? 'green'
                  : 'red'
                : 'black',
          }}>
          <TextInput
            style={{height: 40}}
            autoCorrect={false}
            onChangeText={setWord}
            value={wordGiven}
            autoCapitalize={'none'}
            // placeholder=""
          />
        </View>
      </View>
    );
  };

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <View style={{flexDirection: 'column'}}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>This is your recovery phrase</Text>
        </View>
        <Spacing40 />
        <View>
          <Text style={styles.text}>
            Write the correct word beside the number
          </Text>
        </View>
        <Spacing40 />
        {words && (
          <View style={{flexDirection: 'column'}}>
            {renderWord(
              words.word1.index,
              words.word1.word,
              word1Given,
              setWord1Given,
            )}
            <View style={styles.separator} />
            {renderWord(
              words.word2.index,
              words.word2.word,
              word2Given,
              setWord2Given,
            )}
            <View style={styles.separator} />
            {renderWord(
              words.word3.index,
              words.word3.word,
              word3Given,
              setWord3Given,
            )}
          </View>
        )}
      </View>
      <SpacingVar length={60} />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ContinueButton
          disabled={
            !words ||
            words.word1.word !== word1Given ||
            words.word2.word !== word2Given ||
            words.word3.word !== word3Given // Notice that you had word2 being checked twice. This fixes that.
          }
          color={'#F7931A'}
          onPress={onContinuePress}
        />
      </View>
    </Margin20View>
  );
};

export default VerifyMnemonic;
