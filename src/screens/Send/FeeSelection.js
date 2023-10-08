import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  TextInput,
  Button,
  Alert,
  Platform,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {ContinueButton, SpacingVar} from '../../components/general';
import {Margin20View} from '../../components/marginedView';
import CaretRightIcon from '../../assets/icons/bitcoin-icons/svg/outline/caret-right.svg';
import {navigate} from '../../navigation/NavigationService';
import {StorageContext} from '../../storage-context';
import {getFeeRecommendation} from '../../lib/api/wallet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  circle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  radioButtonTextLabel: {
    fontSize: 16,
  },
  radioButtonTextFeeRate: {
    fontFamily: 'Inter',
    fontSize: Platform.OS === 'ios' ? 5.5 : 16.5,
  },
  radioButtonTextDuration: {
    color: 'gray',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8,
  },
  // Styles for the prompt modal:
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

const RadioButton = ({label, duration, fee, feeFiat, selected, onPress}) => {
  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      <View style={styles.circle}>
        {selected ? <View style={styles.selectedCircle} /> : null}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
        }}>
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.radioButtonTextLabel}>{label}</Text>
          <Text style={styles.radioButtonTextDuration}>{duration}</Text>
        </View>
        <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
          <Text style={styles.radioButtonTextFeeRate}>
            {fee.toLocaleString('en-US')} sats/vB
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CustomFeeButton = ({
  label,
  fee,
  selected,
  onPress,
  setPromptVisible,
  isPromptVisible,
  customFeeRate,
  setCustomFeeRate,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleOk = () => {
    setHasFeeRate(true);
    const parsedValue = parseFloat(inputValue); // or parseInt(value, 10) for integers
    if (!isNaN(parsedValue)) {
      setCustomFeeRate(parsedValue);
    } else {
      Alert.alert('Invalid input', 'The input you gave was not a valid number');
    }

    setInputValue('');
    setPromptVisible(false);
  };

  const handleCancel = () => {
    setInputValue('');
    setPromptVisible(false);
  };

  const [hasFeeRate, setHasFeeRate] = useState(false);

  const renderModal = () => {
    return (
      <Modal transparent={true} animationType="slide" visible={isPromptVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Enter Value:</Text>
            <TextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="In Sats/vB"
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <Button title="OK" onPress={handleOk} />
              <Button title="Cancel" onPress={handleCancel} />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      {renderModal()}
      <View style={styles.circle}>
        {selected ? <View style={styles.selectedCircle} /> : null}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
        }}>
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.radioButtonTextLabel}>{label}</Text>
        </View>
        {hasFeeRate ? (
          <>
            <View style={{flexDirection: 'column'}}>
              <Text style={styles.radioButtonTextFeeRate}>
                {customFeeRate} sats/vB
              </Text>
            </View>
          </>
        ) : (
          <>
            <View>
              <CaretRightIcon
                style={{height: 20, width: 20, color: '#000000'}}
              />
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const RadioButtonGroup = ({
  options,
  selectedValue,
  onValueChange,
  setCustomFeeRate,
  customFeeRate,
}) => {
  const [isPromptVisible, setPromptVisible] = useState(false);

  return (
    <View>
      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
        <Text>Priority & arrival time</Text>
        <Text>Fee</Text>
      </View>
      <View style={styles.separator} />
      {options.map((item, index) => (
        <View key={index}>
          <RadioButton
            label={item.label}
            duration={item.duration}
            fee={item.fee}
            feeFiat={item.feeFiat}
            selected={selectedValue === item.fee}
            onPress={() => onValueChange(item.fee)}
          />
          {index < options.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
      <View style={styles.separator} />
      <CustomFeeButton
        label={'Custom'}
        onPress={() => {
          onValueChange(4);
          setPromptVisible(true);
        }}
        setCustomFeeRate={setCustomFeeRate}
        setPromptVisible={setPromptVisible}
        isPromptVisible={isPromptVisible}
        customFeeRate={customFeeRate}
        selected={selectedValue === 4}
      />
    </View>
  );
};

const FeeSelection = () => {
  const {wallet} = useContext(StorageContext);
  const {address, amount} = useRoute().params;
  const [selectedValue, setSelectedValue] = useState(0);
  const [customFeeRate, setCustomFeeRate] = useState(0);
  const [options, setOptions] = useState(undefined);

  useEffect(() => {
    makeFeeSelection().catch(e => console.error(e));
  }, []);

  const makeFeeSelection = async () => {
    const fees = await getFeeRecommendation();
    let optionsPrep = [
      {
        label: 'High',
        duration: '10-20 minutes',
        value: 1,
      },
      {
        label: 'Medium',
        duration: '30-40 minutes',
        value: 2,
      },
      {label: 'Low', duration: '+60 minutes', value: 3},
    ];
    optionsPrep.forEach(option => {
      switch (option.value) {
        case 1:
          option.fee = fees.fastestFee + 10;
          break;
        case 2:
          option.fee = fees.halfHourFee + 5;
          break;
        case 3:
          option.fee = fees.hourFee;
          break;
      }
    });
    setOptions(optionsPrep);
  };
  const onContinuePress = () => {
    let feeRate;
    if (selectedValue === 4) {
      feeRate = customFeeRate;
    } else {
      feeRate = selectedValue;
    }

    console.log(
      `Send ${amount} sats to ${address} with the fee rate ${feeRate}`,
    );
    const psbt = wallet.makeTransaction(
      [[address, parseInt(amount, 10)]],
      feeRate,
    );
    if (!psbt) {
      Alert.alert('Could not create transaction'); // todo should the user see low level error here?
      return;
    }

    navigate('SendDetailsRoot', {
      screen: 'ReviewDetails',
      params: {
        address: address,
        amount: amount,
        txHex: psbt.extractTransaction(false).toHex(),
        txId: psbt.extractTransaction(true).getId(), // no need to check here again
        effectiveFeeRate: psbt.getFeeRate(),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#F5F5F5'}]}>
      <KeyboardAvoidingView style={styles.container}>
        <Margin20View>
          <Text style={styles.title}>Choose a fee rate</Text>
          <SpacingVar length={30} />
          {options && (
            <>
              <RadioButtonGroup
                style={{flex: 1}}
                options={options}
                selectedValue={selectedValue}
                onValueChange={value => setSelectedValue(value)}
                setCustomFeeRate={setCustomFeeRate}
                customFeeRate={customFeeRate}
              />
              <View style={{flex: 1, justifyContent: 'flex-end'}}>
                <ContinueButton
                  disabled={selectedValue === 0 && customFeeRate === 0}
                  color={'#F7931A'}
                  onPress={onContinuePress}
                />
              </View>
            </>
          )}
        </Margin20View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FeeSelection;
