import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Text, Platform, Alert} from 'react-native';
import {Margin20View} from '../../components/marginedView';
import {ContinueButton, Spacing05, SpacingVar} from '../../components/general';
import {useRoute} from '@react-navigation/native';
import {submitTxHex, submitTxHexTor} from '../../lib/api/wallet';
import {navigate} from '../../navigation/NavigationService';
import {StorageContext} from '../../storage-context';

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
    fontSize: Platform.OS === 'ios' ? 5.5 : 16.5,
  },
});

const ReviewDetails = () => {
  const {tor, wallet, setWalletAndSave, update, isTorEnabled} =
    useContext(StorageContext);
  const {address, amount, txHex, effectiveFeeRate, txId} = useRoute().params;

  const onContinuePress = async () => {
    console.log('attempting send of transaction');
    let success = false;
    let error = '';

    if (isTorEnabled) {
      ({success, err: error} = await submitTxHexTor(tor, txHex));
    } else {
      ({success, err: error} = await submitTxHex(txHex));
    }

    console.log(success);
    if (success) {
      const updatedWallet = wallet.removeJustSpentUTXOs(txHex);
      setWalletAndSave(updatedWallet);
      update();

      navigate('SendDetailsRoot', {
        screen: 'ResultPositive',
        params: {
          txId: txId,
        },
      });
    } else {
      console.error(error);
      Alert.alert('Could not send transaction', error.toString()); // todo should the user see low level error here?
    }
  };

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <View style={{flex: 1}}>
        <Text style={styles.title}>Review send details</Text>
        <SpacingVar length={30} />
        <Text style={styles.labels}>Address</Text>
        <Spacing05 />
        <Text style={{fontSize: 17}}>{address}</Text>
        <View style={styles.separator} />

        <Text style={styles.labels}>Amount</Text>
        <Spacing05 />
        <Text style={styles.numbersText}>
          {parseInt(amount, 10).toLocaleString('en-US')}
        </Text>
        <View style={styles.separator} />

        <Text style={styles.labels}>Fee rate</Text>
        <Spacing05 />
        <Text style={styles.numbersText}>
          {parseInt(effectiveFeeRate, 10).toFixed(2).toLocaleString('en-US')}{' '}
          sats/vB
        </Text>
      </View>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ContinueButton
          text={'Send'}
          color={'#F7931A'}
          onPress={onContinuePress}
        />
      </View>
    </Margin20View>
  );
};

export default ReviewDetails;
