import React, {useState} from 'react';
import {View, StyleSheet, Text, Linking, TouchableOpacity} from 'react-native';
import {Margin20View} from '../../components/marginedView';
import {
  ContinueButton,
  Spacing10,
  Spacing20,
  SpacingVar,
  WideButton,
} from '../../components/general';
import {useRoute} from '@react-navigation/native';
import {navigate} from '../../navigation/NavigationService';
import CheckIcon from '../../assets/icons/bitcoin-icons/svg/filled/check.svg';
import Clipboard from '@react-native-clipboard/clipboard';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  labels: {
    fontWeight: 'bold',
  },
  numbersText: {
    fontFamily: 'Inter',
    fontSize: 5.5,
  },
  Circle: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: '#29961e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  Icon: {
    height: 90,
    width: 90,
    color: '#F5F5F5',
  },
});

const ResultPositive = () => {
  const [copied, setCopied] = useState(false);
  const {txId} = useRoute().params;

  const onContinuePress = () => {
    navigate('HomeScreenRoot', {
      screen: 'HomeScreen',
    });
  };

  const onPressTxid = () => {
    Clipboard.setString(txId);
    setCopied(true);
  };

  const openTransaction = async () => {
    await Linking.openURL('https://mempool.space/signet/tx/' + txId);
  };

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <View style={{flex: 1}}>
        <Text style={styles.title}>Transaction sent</Text>
        <Spacing20 />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={styles.Circle}>
            <CheckIcon style={styles.Icon} />
          </View>
        </View>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={onPressTxid}>
            <Text style={{textAlign: 'center'}}>{txId}</Text>
          </TouchableOpacity>
          {copied && (
            <>
              <Spacing10 />
              <Text style={{fontSize: 12, color: 'gray'}}>
                Copied to Clipboard
              </Text>
            </>
          )}
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <WideButton
          text={'View transaction'}
          textColor={'#000000'}
          color={'transparent'}
          onPress={openTransaction}
        />
        <SpacingVar length={15} />
        <ContinueButton
          text={'Back to home'}
          color={'#F7931A'}
          onPress={onContinuePress}
        />
      </View>
    </Margin20View>
  );
};

export default ResultPositive;
