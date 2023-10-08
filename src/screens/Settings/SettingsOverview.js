// todo
//  - hard rescan, delete old utxos and transaction and do a full rescan from block_height x/birth_height
//  - delete wallet and completely remove the secure key for new startup

import React from 'react';
import {Margin20View} from '../../components/marginedView';
import {navigate} from '../../navigation/NavigationService';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SpacingVar} from '../../components/general';
import CaretRightIcon from '../../assets/icons/bitcoin-icons/svg/filled/caret-right.svg';

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

const SettingsOverview = () => {
  const goToTorSettings = () => {
    navigate('SettingsRoot', {
      screen: 'TorSetting',
    });
  };

  const goToWalletSettings = () => {
    navigate('SettingsRoot', {
      screen: 'WalletSettingsOverview',
    });
  };

  const options = [
    {
      label: 'Tor',
      goTo: goToTorSettings,
    },
    {
      label: 'Wallet',
      goTo: goToWalletSettings,
    },
  ];

  return (
    <Margin20View>
      <View style={{flexDirection: 'column'}}>
        <Text style={styles.title}>Settings</Text>
        <SpacingVar length={30} />
        <View style={styles.separator} />
        {options.map((option, index) => (
          <View key={index}>
            {/*{index !== options.length - 1 && <View style={styles.separator} />}*/}
            <TouchableOpacity onPress={option.goTo}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.label}>{option.label}</Text>
                <CaretRightIcon style={styles.caret} />
              </View>
            </TouchableOpacity>
            <View style={styles.separator} />
          </View>
        ))}
      </View>
    </Margin20View>
  );
};

export default SettingsOverview;
