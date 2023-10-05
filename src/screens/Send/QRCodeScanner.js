import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  StyleSheet,
} from 'react-native';
import {CameraScreen} from 'react-native-camera-kit';
import CrossIcon from '../../assets/icons/bitcoin-icons/svg/filled/cross.svg';
import * as navigation from '../../navigation/NavigationService';

const styles = StyleSheet.create({});
const QRCodeScanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState(false);
  const [loadedData, setLoadedData] = useState('');

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'ios' || Platform.OS === 'macos') {
          setCameraStatus(true);
          return;
        }
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '',
            message: 'Permission to access camera',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'No',
            buttonPositive: 'Yes',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCameraStatus(true);
        } else {
          setCameraStatus(false);
        }
      } catch (err) {
        console.warn(err);
      }
    })();
  }, []);

  const onBarCodeRead = ret => {
    if (!isLoading) {
      setIsLoading(true);
      try {
        console.log('read data');
        navigation.navigate('SendDetailsRoot', {
          screen: 'SendDetails',
          params: {addressScan: ret.data},
        });
      } catch (e) {
        console.log(e);
      }
    }
    setIsLoading(false);
  };

  const dismiss = () => {
    // make variable if more screens can launch this
    navigation.navigate('SendDetailsRoot', {screen: 'SendDetails'});
  };

  return (
    <View style={{flex: 1}}>
      {cameraStatus ? (
        <CameraScreen
          scanBarcode
          onReadCode={event =>
            onBarCodeRead({data: event?.nativeEvent?.codeStringValue})
          }
          showFrame={false}
        />
      ) : null}
      <TouchableOpacity
        style={{position: 'absolute', top: 10, left: 10}}
        onPress={dismiss}>
        <CrossIcon style={{height: 32, width: 32}} />
      </TouchableOpacity>
    </View>
  );
};

export default QRCodeScanner;
