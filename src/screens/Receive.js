import React, {useContext, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';

import Margin20View from '../components/marginedView';
import {StorageContext} from '../storage-context';
import {Spacing10, Spacing20, SpacingVar} from '../components/general';

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  qrCode: {
    height: 256,
    width: 256,
  },
});

const Receive = () => {
  const {wallet} = useContext(StorageContext);
  const [copied, setCopied] = useState(false);
  const onPressAddress = () => {
    Clipboard.setString(wallet.address);
    setCopied(true);
  };

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <Text style={styles.title}>Receive details</Text>
      <SpacingVar length={30} />
      <View style={{alignItems: 'center'}}>
        <QRCode size={300} value={'bitcoin:' + wallet.address} />
        <Spacing20 />
        <TouchableOpacity onPress={onPressAddress}>
          <Text style={{textAlign: 'center'}}>{wallet.address}</Text>
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
    </Margin20View>
  );
};

export default Receive;
