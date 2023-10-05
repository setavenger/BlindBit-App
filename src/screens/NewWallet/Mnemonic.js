import React, {useEffect, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import Margin20View from '../../components/marginedView';
import {
  ContinueButton,
  Spacing05,
  Spacing20,
  Spacing40,
  SpacingVar,
} from '../../components/general';
import {navigate} from '../../navigation/NavigationService';
import {newMnemonic} from '../../lib/wallet/newWallet';

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
const Mnemonic = () => {
  const [mnemonic, setMnemonic] = useState(['']);
  const onContinuePress = () => {
    navigate('VerifyMnemonicRoot', {
      screen: 'VerifyMnemonic',
      params: {mnemonic},
    });
  };

  useEffect(() => {
    (async function () {
      const secret = await newMnemonic();
      setMnemonic(secret.split(' '));
    })();
  }, []);

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>This is your recovery phrase</Text>
        </View>
        <Spacing40 />
        <View>
          <Text style={styles.text}>
            Make sure to write it down as shown here. You have to verify this
            later.
          </Text>
        </View>
        <Spacing40 />
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {mnemonic.map((item, index) => (
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
                    // overflow: 'hidden', // Important for Android
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{padding: 10, textAlign: 'center', fontSize: 20}}>
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
                  <Text style={{padding: 10, fontSize: 20}}>{item}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ContinueButton color={'#F7931A'} onPress={onContinuePress} />
      </View>
    </Margin20View>
  );
};

export default Mnemonic;
