import {createContext, useState} from 'react';
import Tor from 'react-native-tor';
import {Wallet} from './lib/wallet/wallet';
const bip39 = require('bip39');
import RNSecureKeyStore, {ACCESSIBLE} from 'react-native-secure-key-store';
import elliptic from 'elliptic';
import {getPrice} from './lib/api/priceFiat';
const secp256k1 = new elliptic.ec('secp256k1');
let Buffer = require('buffer/').Buffer;

export const StorageContext = createContext(undefined);

export const LoadStates = {
  NotLoaded: 'notLoaded', // no data ahs been tried to be fetched
  Loaded: 'loaded', // user data exists
  New: 'new', // no data exists, new wallet should be created
};
const StorageProvider = ({children}) => {
  const [wallet, setWallet] = useState(null);
  const [loadState, setLoadState] = useState(LoadStates.NotLoaded);
  const [price, setPrice] = useState(false);
  const [updater, setUpdater] = useState(0);
  const tor = Tor();

  const update = () => {
    setUpdater(Date.now);
  };
  const loadWallet = async () => {
    try {
      await tor.startIfNotStarted();
    } catch (e) {
      console.warn(e);
    }

    try {
      const data = await RNSecureKeyStore.get('wallet');
      const res = JSON.parse(data);

      const scanKey = secp256k1.keyFromPrivate(Buffer.from(res.scan, 'hex'));
      const spendKey = secp256k1.keyFromPrivate(Buffer.from(res.spend, 'hex'));

      let newWallet = new Wallet(
        scanKey,
        spendKey,
        res.mnemonic,
        res.birthHeight,
        res.transactions,
        res.utxos,
        res.spentTxos,
        res.labels,
        res.lastBlockHeight,
      );
      setWallet(newWallet);
      setLoadState(LoadStates.Loaded);
    } catch (err) {
      console.log(err);
      // const seed = await bip39.mnemonicToSeed(
      //   'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      // );
      // const {scan, spend} = splib.deriveSilentPaymentKeyPair(seed);
      //
      // const walletToSet = new Wallet(scan, spend);
      // setWallet(walletToSet);

      // todo add actions depending on the error, for now create new user/seed
      setLoadState(LoadStates.New);
    }
    const priceNew = await getPrice();
    console.log('New price:', priceNew);
    setPrice(priceNew);
  };

  const saveWalletData = async walletToSave => {
    console.log('saving wallet data');

    // strip down wallet to save space
    let walletData = {};
    walletData.scan = walletToSave.scan.getPrivate('hex');
    walletData.spend = walletToSave.spend.getPrivate('hex');
    walletData.mnemonic = walletToSave.mnemonic;
    walletData.birthHeight = walletToSave.birthHeight;
    walletData.transactions = walletToSave.transactions;
    walletData.utxos = walletToSave.utxos;
    walletData.spentTxos = walletToSave.spentTxos;
    walletData.labels = walletToSave.labels;
    walletData.lastBlockHeight = walletToSave.lastBlockHeight;

    await RNSecureKeyStore.set('wallet', JSON.stringify(walletData), {
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  };

  const setWalletAndSave = async walletToSave => {
    setWallet(walletToSave);
    await saveWalletData(walletToSave);
  };

  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <StorageContext.Provider
      value={{
        wallet,
        setWallet,
        setWalletAndSave,
        loadWallet,
        loadState,
        setLoadState,
        price,
        setPrice,
        saveWalletData,
        tor,
        update,
        updater,
      }}>
      {children}
    </StorageContext.Provider>
  );
};
export default StorageProvider;
