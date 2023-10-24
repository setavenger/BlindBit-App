import React, {useContext, useEffect, useRef, useState} from 'react';
import {Margin20View} from '../components/marginedView';
import {
  Animated,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MainButton from '../components/mainbutton';
import ArrowUpIcon from '../assets/icons/bitcoin-icons/svg/filled/arrow-up.svg';
import ArrowDownIcon from '../assets/icons/bitcoin-icons/svg/filled/arrow-down.svg';
import GearIcon from '../assets/icons/bitcoin-icons/svg/outline/gear.svg';
import RefreshIcon from '../assets/icons/bitcoin-icons/svg/outline/refresh.svg';
import CaretUpIcon from '../assets/icons/bitcoin-icons/svg/filled/caret-up.svg';

import {Spacing05, SpacingVar} from '../components/general';
import {navigate} from '../navigation/NavigationService';
import {StorageContext} from '../storage-context';
import {getPrice} from '../lib/api/priceFiat';
import {showConfirmAlert} from '../components/confirm';
import {newMnemonic} from '../lib/wallet/newWallet';
import {getBestBlock} from '../lib/api/wallet';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  icon: {
    width: 64,
    height: 64,
  },
  containerTopBar: {
    height: 50,
    // backgroundColor: '#ff0000',
  },
  containerMiddle: {
    flex: 1,
    justifyContent: 'center',
    // backgroundColor: '#00ff00',
  },
  containerBottom: {
    alignItems: 'center',
    marginBottom: 10,
  },
  containerSendReceive: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerBalance: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  bottomTxs: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  topBarIcon: {
    height: 40,
    width: 40,
    color: '#000000',
  },
  newTxCaretIcon: {
    height: 24,
    width: 24,
    color: 'gray',
  },
  textBalanceLabel: {
    fontSize: 15,
    color: 'gray',
  },
  textBalanceMain: {
    fontSize: Platform.OS === 'ios' ? 10 : 40,
    fontFamily: 'Inter-Regular', //todo fix font not being used in android, then same font sizes will probably work as well
  },
  textBalanceFiat: {
    fontSize: Platform.OS === 'ios' ? 5 : 20,
    fontFamily: 'Inter-Regular',
    color: 'gray',
  },
  textReceivedTransaction: {
    fontSize: Platform.OS === 'ios' ? 6.5 : 26,
    fontFamily: 'Inter-Regular',
    color: 'gray',
  },
});

const Home = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const rotateValue = useRef(new Animated.Value(0)).current;
  const {wallet, price, setPrice, saveWalletData, updater} =
    useContext(StorageContext);
  const [balance, setBalance] = useState(0);
  const [balanceFiat, setBalanceFiat] = useState(0);
  const [lastReceived, setLastReceived] = useState(undefined);
  const [lastReceivedText, setLastReceivedText] = useState('');
  const [bestHeight, setBestHeight] = useState(0);
  const [syncHeight, setSyncHeight] = useState(0);

  useEffect(() => {
    console.log('computing balance');
    const bal = wallet.computeBalance();
    // console.log(bal, price);
    const balFiat = (bal / 100_000_000) * price;
    setBalance(bal);
    setBalanceFiat(balFiat);

    // todo only use last received of non change address
    //  => flag change addresses in the utxo set in order to avoid this
    //  and for future privacy enhancements
    // has to be kept like this just if (lastReceived) does not work
    if (lastReceived) {
      setLastReceivedText(lastReceived.value.toLocaleString('en-US'));
    }
  }, [updater, wallet, price, lastReceived]);

  useEffect(() => {
    setSyncHeight(wallet.lastBlockHeight);
    (async function () {
      try {
        const bestBlock = await getBestBlock();
        console.log('Best server block', bestBlock);
        setBestHeight(bestBlock.block_height);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [wallet]);

  const navigateToSend = () => {
    navigate('SendDetailsRoot', {
      screen: 'SendDetails',
    });
  };

  const navigateToReceive = () => {
    navigate('ReceiveScreenRoot', {
      screen: 'ReceiveScreen',
    });
  };

  const navigateToSettings = () => {
    navigate('SettingsRoot');
  };

  const triggerRefresh = async () => {
    setIsSyncing(true);
    if (!isSyncing) {
      try {
        startRotation();
        await wallet.syncWallet(saveWalletData, setSyncHeight, setBestHeight);

        setIsSyncing(false);
        setBalance(wallet.computeBalance());

        await new Promise(resolve => {
          Animated.timing(rotateValue, {
            toValue: 0,
            duration: 500, // you can adjust the duration as you see fit
            useNativeDriver: true,
          }).start(() => {
            // Once the back-rotation is complete, stop the looped rotation
            rotateValue.stopAnimation();
            resolve();
          });
        });

        const priceNew = await getPrice();
        console.log('New price:', priceNew);
        setPrice(priceNew);

        // Determines the last utxo which was received that was not change.
        for (let i = 0; i < wallet.utxos.length; i++) {
          const utxo = wallet.utxos[wallet.utxos.length - i - 1];
          if (!utxo.change) {
            setLastReceived(utxo);
            break;
          }
        }
        await saveWalletData(wallet);
      } catch (e) {
        console.log(e);
        setIsSyncing(false);
        rotateValue.stopAnimation();
      }
    }
  };

  const triggerHardRefresh = async () => {
    const confirm = await showConfirmAlert(
      undefined,
      'do you want force refresh, this may take a while',
    );
    if (!confirm) {
      return;
    }
    setIsSyncing(true);
    if (!isSyncing) {
      try {
        startRotation();
        await wallet.syncWallet(
          saveWalletData,
          setSyncHeight,
          setBestHeight,
          undefined,
          true,
        );

        setIsSyncing(false);
        setBalance(wallet.computeBalance());

        await new Promise(resolve => {
          Animated.timing(rotateValue, {
            toValue: 0,
            duration: 500, // you can adjust the duration as you see fit
            useNativeDriver: true,
          }).start(() => {
            // Once the back-rotation is complete, stop the looped rotation
            rotateValue.stopAnimation();
            resolve();
          });
        });

        const priceNew = await getPrice();
        console.log('New price:', priceNew);
        setPrice(priceNew);

        // Determines the last utxo which was received that was not change.
        for (let i = 0; i < wallet.utxos.length; i++) {
          const utxo = wallet.utxos[wallet.utxos.length - i - 1];
          if (!utxo.change) {
            setLastReceived(utxo);
            break;
          }
        }
        await saveWalletData(wallet);
      } catch (e) {
        console.log(e);
        setIsSyncing(false);
        rotateValue.stopAnimation();
      }
    }
  };

  const renderTopBar = props => {
    // todo add indicator for sync progress
    return (
      <View style={styles.topBar}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Animated.View style={{transform: [{rotate: spin}]}}>
            <TouchableOpacity
              onPress={triggerRefresh}
              onLongPress={triggerHardRefresh}>
              <RefreshIcon style={styles.topBarIcon} />
            </TouchableOpacity>
          </Animated.View>
          <View>
            <Text>
              Sync: {syncHeight}/{bestHeight}
            </Text>
          </View>
        </View>
        <View>
          <Text style={{color: '#FF0000'}}>Signet</Text>
        </View>
        <TouchableOpacity onPress={navigateToSettings}>
          <GearIcon style={styles.topBarIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const startRotation = () => {
    rotateValue.setValue(0);
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  };

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderTransactionSwipUp = props => {
    return (
      <>
        {lastReceived && (
          <TouchableOpacity style={styles.bottomTxs}>
            <CaretUpIcon style={styles.newTxCaretIcon} />
            <Text style={styles.textReceivedTransaction}>
              Received {lastReceivedText} sats
            </Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <Margin20View style={styles.container} loading={false}>
      <View style={styles.containerTopBar}>{renderTopBar()}</View>
      <View style={styles.containerMiddle}>
        <View style={styles.containerBalance}>
          <Text style={styles.textBalanceLabel}> Balance</Text>
          <Spacing05 />
          <Text style={styles.textBalanceMain}>
            {balance.toLocaleString('en-US')} sats
          </Text>
          <Spacing05 />
          <Text style={styles.textBalanceFiat}>
            $
            {balanceFiat.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        <SpacingVar length={30} />
        <View style={styles.containerSendReceive}>
          <MainButton
            Icon={ArrowUpIcon}
            text={'Send'}
            onPress={navigateToSend}
          />
          <MainButton
            Icon={ArrowDownIcon}
            text={'Receive'}
            onPress={navigateToReceive}
          />
        </View>
        <SpacingVar length={90} />
      </View>
      <View style={styles.containerBottom}>{renderTransactionSwipUp()}</View>
    </Margin20View>
  );
};

export default Home;
