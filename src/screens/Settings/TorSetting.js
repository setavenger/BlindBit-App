import React, {useContext} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Margin20View} from '../../components/marginedView';
import {StorageContext} from '../../storage-context';
import {ContinueButton, Spacing20, SpacingVar} from '../../components/general';

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

const TorSetting = () => {
  const {isTorEnabled, setIsTorEnabled, saveTorSettings} =
    useContext(StorageContext);

  const save = async state => {
    await saveTorSettings(state);
  };

  return (
    <Margin20View>
      <View>
        <Text style={styles.title}>Tor Settings</Text>
        <SpacingVar length={30} />
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.label}>Tor</Text>
          <Switch
            trackColor={{false: '#767577', true: '#000000'}}
            thumbColor={isTorEnabled ? '#F7931A' : '#f4f3f4'}
            onValueChange={async () => {
              const newValue = !isTorEnabled;
              await save(newValue);
              setIsTorEnabled(newValue);
            }}
            value={isTorEnabled}
          />
        </View>
        <Spacing20 />
        <Text>
          When this is activated your transactions will be submitted via the tor
          network. This improves your privacy.
        </Text>
      </View>
      {/*<View style={{flex: 1, justifyContent: 'flex-end'}}>*/}
      {/*  <ContinueButton text={'Save'} color={'#F7931A'} onPress={save} />*/}
      {/*</View>*/}
    </Margin20View>
  );
};

export default TorSetting;
