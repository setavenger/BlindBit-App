// todo
//  - hard rescan, delete old utxos and transaction and do a full rescan from block_height x/birth_height
//  - delete wallet and completely remove the secure key for new startup

import React, {useContext} from 'react';
import {Margin20View} from '../../../components/marginedView';
import {navigate} from '../../../navigation/NavigationService';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SpacingVar} from '../../../components/general';
import CaretRightIcon from '../../../assets/icons/bitcoin-icons/svg/filled/caret-right.svg';
import {showConfirmAlert} from '../../../components/confirm';
import {StorageContext} from '../../../storage-context';
import {StackActions, useNavigation} from '@react-navigation/native';

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 20,
    // fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8,
  },
  caret: {
    width: 32,
    height: 32,
    color: '#000000',
  },
});

const WalletSettingsOverview = () => {
  const {dispatch} = useNavigation();

  const {wallet, deleteWallet} = useContext(StorageContext);

  const resetWallet = async () => {
    const confirm = await showConfirmAlert(
      'Reset Wallet',
      'Are you sure you want to delete your wallet, this cannot be undone. You should make a backup before deleting your wallet otherwise you will permanently loose access to your funds.',
    );
    // make sure no truthy output ever disrupts this
    if (confirm === true) {
      await deleteWallet();
      dispatch(StackActions.replace('Navigation', {screen: 'WelcomeRoot'}));
    }
  };

  const goToViewMnemonic = () => {
    navigate('MnemonicRoot', {
      screen: 'Mnemonic',
      params: {
        passedMnemonic: wallet.mnemonic,
      },
    });
  };
  const options = [
    {
      label: 'View Mnemonic',
      action: goToViewMnemonic,
    },
    {
      label: 'Reset wallet',
      action: resetWallet,
    },
  ];

  return (
    <Margin20View>
      <View style={{flexDirection: 'column'}}>
        <Text style={styles.title}>Wallet Settings</Text>
        <SpacingVar length={30} />
        <View style={styles.separator} />
        {options.map((option, index) => (
          <View key={index}>
            {/*{index !== options.length - 1 && <View style={styles.separator} />}*/}
            <TouchableOpacity onPress={option.action}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={[
                    styles.label,
                    option.label === 'Reset wallet' ? {color: '#FF0000'} : null,
                  ]}>
                  {option.label}
                </Text>
                <CaretRightIcon
                  style={[
                    styles.caret,
                    {
                      color:
                        option.label === 'Reset wallet' ? '#FF0000' : '#000000',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
            <View style={styles.separator} />
          </View>
        ))}
      </View>
    </Margin20View>
  );
};

export default WalletSettingsOverview;
