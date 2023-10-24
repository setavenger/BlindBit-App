import React, {useContext, useEffect, useState} from 'react';
import {Margin20View} from '../../components/marginedView';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ContinueButton,
  Spacing05,
  Spacing20,
  Spacing40,
  SpacingVar,
} from '../../components/general';
import {navigate} from '../../navigation/NavigationService';
import QRCodeIcon from '../../assets/icons/bitcoin-icons/svg/outline/qr-code.svg';
import * as navigation from '../../navigation/NavigationService';
import {useRoute} from '@react-navigation/native';
import {NumericFormat} from 'react-number-format';
import {StorageContext} from '../../storage-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  inputField: {
    height: 40,
    borderRadius: 3,
    borderWidth: 0.7,
    borderColor: 'black',
    padding: 10,
    justifyContent: 'center',
  },
  icon: {
    height: 30,
    width: 30,
    color: '#000000',
  },
});

const SendDetails = () => {
  const {price} = useContext(StorageContext);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [displayAmount, setDisplayAmount] = useState(''); // for storing the formatted display value
  const [amountFiat, setAmountFiat] = useState(0);
  const {addressScan} = useRoute().params || '';

  useEffect(() => {
    if (addressScan) {
      parseAddress(addressScan);
    }
  }, [addressScan]);

  useEffect(() => {
    setAmountFiat((price * amount) / 100_000_000);
  }, [price, amount]);

  const onContinuePress = () => {
    navigate('SendDetailsRoot', {
      screen: 'FeeSelection',
      params: {
        address: address,
        amount: amount,
      },
    });
  };

  const parseAddress = data => {
    if (data.toLowerCase().startsWith('bitcoin:')) {
      setAddress(data.slice(8));
    } else {
      // should have bitcoin: in the beginning. For other cases needs more elaborate parsing capabilities (see bluewallet potentially)
    }
  };

  const onOpenQRScanner = () => {
    console.log('opened scanner');
    navigate('QRScannerRoot', {screen: 'QRScanner'});
  };

  const handleAmountChange = text => {
    // Extract numbers only from the input
    const numericValue = text.replace(/[^0-9]/g, '');

    setAmount(numericValue);

    // Update display amount here (or you can derive it directly in your JSX, but we'll update it here for simplicity)
    setDisplayAmount(text);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#F5F5F5'}]}>
      <KeyboardAvoidingView style={styles.container}>
        <Margin20View>
          <Text style={styles.title}>Choose a recipient</Text>
          <SpacingVar length={30} />
          <View>
            {/*todo make it into reproducible component "formLabel"*/}
            <Text>Address</Text>
            <Spacing05 />
            {/*todo make it into reproducible component "textInput"*/}
            <View
              style={[
                styles.inputField,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}>
              <TextInput
                autoCorrect={false}
                autoCapitalize={'none'}
                style={{
                  flex: 1,
                  height: 40,
                  color: '#000000',
                }}
                onChangeText={setAddress}
                placeholder="bc1p..."
                value={address}
              />
              <TouchableOpacity onPress={onOpenQRScanner}>
                <QRCodeIcon style={styles.icon} />
              </TouchableOpacity>
            </View>
            <Spacing20 />
            <Text>Amount</Text>
            <Spacing05 />
            <View>
              <View style={[styles.inputField]}>
                <NumericFormat
                  value={displayAmount}
                  displayType={'text'}
                  thousandSeparator={true}
                  renderText={value => (
                    <TextInput
                      autoCorrect={false}
                      autoCapitalize={'none'}
                      onChangeText={handleAmountChange}
                      value={value}
                      placeholder="Amount in Sats"
                      keyboardType="numeric"
                      style={{height: 40}}
                    />
                  )}
                />
              </View>
              <Text style={{marginLeft: 10, color: '#808080'}}>
                ${' '}
                {parseFloat(amountFiat, 10).toFixed(2).toLocaleString('en-US')}
              </Text>
            </View>
          </View>
          <Spacing40 />
          <ContinueButton
            disabled={address === '' || amount === ''}
            color={'#F7931A'}
            onPress={onContinuePress}
          />
        </Margin20View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SendDetails;
