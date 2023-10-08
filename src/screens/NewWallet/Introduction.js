import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Margin20View} from '../../components/marginedView';
import {ContinueButton, Spacing20, SpacingVar} from '../../components/general';
import {navigate} from '../../navigation/NavigationService';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 20,
  },
});
const Introduction = () => {
  const [isEnabled1, setIsEnabled1] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);

  const onContinuePress = () => {
    navigate('IntroToMnemonicRoot', {screen: 'IntroToMnemonic'});
  };

  return (
    <Margin20View style={{backgroundColor: '#F5F5F5'}}>
      <View style={{flex: 1, flexDirection: 'column'}}>
        {/*<Spacing20 />*/}
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>
            Two things you {'\n'} must understand
          </Text>
        </View>
        <SpacingVar length={80} />
        <View style={{flex: 1}}>
          <View style={styles.separator} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={{flex: 4}}>
              <Text style={styles.text}>
                With bitcoin, you are your own bank. No one else has access to
                your private keys.
              </Text>
            </View>
            <Spacing20 horizontal={true} />
            <View style={{flex: 1}}>
              <Switch
                trackColor={{false: '#767577', true: '#000000'}}
                thumbColor={isEnabled1 ? '#F7931A' : '#f4f3f4'}
                onValueChange={() =>
                  setIsEnabled1(previousState => !previousState)
                }
                value={isEnabled1}
              />
            </View>
          </View>
          <View style={styles.separator} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={{flex: 4}}>
              <Text style={styles.text}>
                If you lose access to this app, and the backup, we will help you
                create, your bitcoin cannot be recovered.
              </Text>
            </View>
            <Spacing20 horizontal={true} />
            <View style={{flex: 1}}>
              <Switch
                trackColor={{false: '#767577', true: '#000000'}}
                thumbColor={isEnabled2 ? '#F7931A' : '#f4f3f4'}
                // ios_backgroundColor="#3e3e3e"
                onValueChange={() =>
                  setIsEnabled2(previousState => !previousState)
                }
                value={isEnabled2}
              />
            </View>
          </View>
          <View style={styles.separator} />
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ContinueButton
          disabled={!isEnabled1 || !isEnabled2}
          color={'#F7931A'}
          onPress={onContinuePress}
        />
      </View>
    </Margin20View>
  );
};

export default Introduction;
