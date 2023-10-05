import {
  getBestBlock,
  getLightUTXOs,
  getTweakData,
  getSpentUTXOs,
  getFilterTaproot,
} from '../api/wallet';
import splib, {
  getFromPublicECKey,
  getPubKeysFromTweak,
  scanWithTweak,
} from '../silent-payment-lib/lib';
import golomb from 'golomb';
import elliptic from 'elliptic';
import ecc from '../../modules/noble_ecc';
import {getBytes} from '../silent-payment-lib/utils';
const bitcoin = require('../../modules/bitcoinjs-lib/src');
const {ECPairFactory} = require('ecpair');
bitcoin.initEccLib(ecc);

const ECPair = ECPairFactory(ecc);
const secp256k1 = new elliptic.ec('secp256k1');

let Buffer = require('buffer/').Buffer;
let coinSelect = require('coinselect');

// const BIPActivationHeight = 101; // No need to scan below because BIP was not used before this height
const BIPActivationHeight = 162400; // todo SIGNET No need to scan below because BIP was not used before this height

export class Wallet {
  constructor(
    scan,
    spend,
    mnemonic,
    birthHeight,
    transactions = [],
    utxos = [],
    spentTxos = [],
    labels = {},
    lastBlockHeight = birthHeight || BIPActivationHeight,
  ) {
    this.mnemonic = mnemonic; // seed phrase in order to show it to the user in settings
    this.scan = scan;
    this.spend = spend;
    this.birthHeight = birthHeight; // used in order to reduce scanning timeframe
    this.address = splib.encodeSilentPaymentAddress(scan, spend, 'tsp', 0); // todo needs to be changed for production
    this.transactions = transactions;
    this.utxos = utxos;
    this.spentTxos = spentTxos;
    this.labels = labels;
    this.lastBlockHeight = lastBlockHeight; // last block height to which was scanned
    // especially important if somebody accidentally receives a second payment to a used address
    this.scriptsToWatch = []; // array of {script: '5120...', tweak: ''} or mnemonic seeds
  }

  async syncWallet(fromHeight = undefined, hardRefresh = false) {
    console.log('syncing wallet...');
    if (fromHeight) {
      this.lastBlockHeight = fromHeight;
    }
    if (hardRefresh) {
      console.log('hard wallet refresh');
      this.lastBlockHeight = BIPActivationHeight;
      this.utxos = [];
      this.spentTxos = [];
      this.transactions = [];
    }
    console.log('Last local block', this.lastBlockHeight);

    const bestBlock = await getBestBlock();
    console.log('Best server block', bestBlock);
    if (bestBlock.block_height === this.lastBlockHeight) {
      console.info('we are already up to speed');
    }
    for (
      let blockHeight = this.lastBlockHeight + 1;
      blockHeight < bestBlock.block_height + 1;
      blockHeight++
    ) {
      console.log('checking Block:', blockHeight);
      try {
        // todo better error handling
        const newWalletUTXOs = await this.syncBlock(blockHeight);
        console.log('new wallet utxos:', newWalletUTXOs);
        if (newWalletUTXOs) {
          this.addUTXOs(newWalletUTXOs);
        }
        const spentUTXOs = await getSpentUTXOs(blockHeight);
        this.removeSpentUTXOs(spentUTXOs);
        // we only update our height if all processes were successful
        this.lastBlockHeight = blockHeight;
      } catch (e) {
        console.warn(e);
      }
    }
    // this.extractTransactionFromUTXOs();
  }

  async syncBlock(blockHeight) {
    const tweakData = await getTweakData(blockHeight);
    // todo filter is deaktivated on Signet due to lack of node with Cfilters
    const filterResp = await getFilterTaproot(blockHeight);

    console.log('tweaks:', tweakData);
    console.log('filter:', filterResp);
    if (tweakData.length === 0) {
      return;
    }
    const {pubKeysToCheck: pubKeysFromTweak, tweaksAsKey} = getPubKeysFromTweak(
      this.scan,
      this.spend,
      tweakData,
    );

    let pubKeysToCheck = [...pubKeysFromTweak];
    for (const script of this.scriptsToWatch) {
      pubKeysToCheck.push(Buffer.from(script.script, 'hex'));
    }

    const filter = golomb.fromNBytes(19, Buffer.from(filterResp.data, 'hex'));

    const isMatch = filter.matchAny(
      Buffer.from(filterResp.block_header, 'hex').reverse(),
      pubKeysToCheck,
    );

    if (!isMatch) {
      console.log('no matches, try next block');
      return;
    } else {
      console.log('found a match');
    }
    const utxos = await getLightUTXOs(blockHeight);
    let outputsToCheck = [];
    for (const utxo of utxos) {
      const outputAsKey = getFromPublicECKey(
        Buffer.from(utxo.scriptpubkey.slice(4), 'hex'),
      );
      outputsToCheck.push(outputAsKey);
    }

    let matchingScripts = [];
    for (const tweakAsKey of tweaksAsKey) {
      let outputsToCheckCopy = [...outputsToCheck];
      const addToWallet = scanWithTweak(
        this.scan,
        this.spend,
        tweakAsKey,
        outputsToCheckCopy,
      );
      matchingScripts.push(addToWallet);
    }

    let walletUTXOs = [];
    // extract outpoint and value for the addToWallet

    // console.log('utxos:', utxos);
    // console.log('matchingScripts:', matchingScripts);

    for (const scripts of matchingScripts) {
      for (const script of scripts) {
        const matchingData = utxos.filter(
          obj => obj.scriptpubkey.slice(4) === script.pub_key,
        );
        const matchingUTXOData = matchingData[0];
        if (!matchingUTXOData) {
          console.warn('no data matched the filter, should not happen!');
        }
        walletUTXOs.push({
          priv_key_tweak: script.priv_key_tweak,
          pub_key: script.pub_key,
          change: script.is_change,
          txid: matchingUTXOData.txid,
          vout: matchingUTXOData.vout,
          value: matchingUTXOData.value,
        });
      }
    }
    return walletUTXOs;
  }

  makeTransaction(recipients, feeRate) {
    console.log(recipients, feeRate);
    feeRate = Math.ceil(feeRate * 0.8);

    console.log('auto adjusted fee rate to:', feeRate); // coinselect is not optimized for segwit hence the downwards adjustment in fees

    // todo make this somehow dynamic or have a different global constant for development
    const network = bitcoin.networks.regtest;

    let utxos = [];
    for (const utxo of this.utxos) {
      utxos.push({
        txId: utxo.txid,
        vout: utxo.vout,
        value: utxo.value,
        priv_key_tweak: utxo.priv_key_tweak,
        pub_key: utxo.pub_key,
        witnessUtxo: {
          script: Buffer.from('5120' + utxo.pub_key, 'hex'),
          value: utxo.value,
        },
      });
    }

    let targets = [];
    for (const recipient of recipients) {
      targets.push({address: recipient[0], value: recipient[1]});
    }

    let {inputs, outputs, fee} = coinSelect(utxos, targets, feeRate);

    // the accumulated fee is always returned for analysis
    console.log(fee);

    // .inputs and .outputs will be undefined if no solution was found
    if (!inputs || !outputs) {
      return;
    }

    const privateKeys = this.generatePrivateKey(inputs);

    let hasSPAddress = false;

    for (const output of outputs) {
      if (
        (output.address && output.address.startsWith('tsp')) ||
        (output.address && output.address.startsWith('sp'))
      ) {
        hasSPAddress = true;
        break;
      }
    }

    let outpoints = [];
    for (const input of inputs) {
      outpoints.push([input.txId, input.vout]);
    }
    const outpointsHash = splib.hashOutpoints(outpoints);

    let privKeysHex = [];
    for (const privateKey of privateKeys) {
      privKeysHex.push([privateKey.getPrivate().toString('hex'), true]);
    }
    if (hasSPAddress) {
      // if we find a silent payment address we have to do something extra with address and get the script for it

      outputs.forEach(output => {
        let outputsSP = [];
        if (output.address && output.address.startsWith('tsp')) {
          outputsSP = splib.createOutputs(
            privKeysHex,
            outpointsHash,
            recipients,
            'tsp',
          );
          // add script to output which will be recognized later
          output.script = '5120' + outputsSP[0][0];
        } else if (output.address && output.address.startsWith('sp')) {
          outputsSP = splib.createOutputs(
            privKeysHex,
            outpointsHash,
            recipients,
            'sp',
          );
          // add script to output which will be recognized later
          output.script = '5120' + outputsSP[0][0];
        } else {
          //   do nothing stays as is
        }
      });
    }
    const psbt = new bitcoin.Psbt({network: network});

    inputs.forEach((input, idx) => {
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
        witnessUtxo: input.witnessUtxo,
        tapInternalKey: getBytes(privateKeys[idx], true),
      });
    });
    let k = 0;
    outputs.forEach(output => {
      // outputs without address go straight back to the wallet via SP change address
      if (!output.address) {
        output.script = this.getChangeScript(privateKeys, outpointsHash, k);
        k++;
      }

      if (output.script) {
        psbt.addOutput({
          script: Buffer.from(output.script, 'hex'),
          value: output.value,
        });
      } else {
        psbt.addOutput({
          address: output.address,
          value: output.value,
        });
      }
    });

    // sign the inputs
    for (let i = 0; i < inputs.length; i++) {
      const keyAsECPair = ECPair.fromPrivateKey(
        privateKeys[i].getPrivate().toArrayLike(Buffer, 'be', 32),
        {network: network},
      ); // derive private key from seed;
      psbt.signInput(i, keyAsECPair);
    }
    // psbt.validateSignaturesOfInput(0);
    psbt.finalizeAllInputs();

    const txHex = psbt.extractTransaction(true).toHex();
    console.log('Transaction Hex:', txHex);

    return psbt;
  }

  getChangeScript(inputPrivKeys, outpointsHash, k) {
    const changePubKey = splib.getChangePubKey(
      this.scan,
      this.spend,
      inputPrivKeys,
      outpointsHash,
      k,
    );
    return '5120' + changePubKey;
  }

  generatePrivateKey(inputs) {
    let privKeys = [];
    for (const input of inputs) {
      let fullPrivKey;
      const fullPrivKeyBN = this.spend
        .getPrivate()
        .add(secp256k1.keyFromPrivate(input.priv_key_tweak).getPrivate());
      fullPrivKey = secp256k1.keyFromPrivate(fullPrivKeyBN);
      if (fullPrivKey.getPublic().getY().isOdd()) {
        const newPrivateKeyBN = secp256k1.n.sub(fullPrivKey.getPrivate());
        fullPrivKey = secp256k1.keyFromPrivate(newPrivateKeyBN);
      }
      privKeys.push(fullPrivKey);
    }
    return privKeys;
  }

  addUTXOs(utxos) {
    for (const utxo of utxos) {
      this.addObjectIfNotExists(this.utxos, utxo);
      this.addObjectIfNotExists(this.scriptsToWatch, {
        script: '5120' + utxo.pub_key,
        priv_key_tweak: utxo.priv_key_tweak,
      });
    }
  }

  removeSpentUTXOs(spentUTXOs) {
    let mySpentTXOs = [];

    console.log(spentUTXOs);
    console.log(this.utxos);

    this.utxos = this.utxos.filter(b => {
      for (let a of spentUTXOs) {
        if (a.vout === b.vout && a.txid === b.txid) {
          mySpentTXOs.push(a);
          return false;
        }
      }
      return true;
    });

    console.log(this.utxos);

    this.spentTxos = [...this.spentTxos, ...mySpentTXOs];
  }

  removeJustSpentUTXOs(txHex) {
    let spentUTXOs = [];
    const tx = bitcoin.Transaction.fromHex(txHex);
    for (const input of tx.ins) {
      spentUTXOs.push({
        spent_in: tx.getId(),
        txid: Buffer.from(input.hash).reverse().toString('hex'),
        vout: input.index,
      });
    }
    this.removeSpentUTXOs(spentUTXOs);
    return this;
  }

  extractTransactionFromUTXOs() {
    console.log('Extracting transaction...');
    console.log(this.utxos);
    console.log(this.spentTxos);

    const filteredSpentTXOArray = this.spentTxos.map(
      spentTxo => spentTxo.spent_in,
    );
    const filteredUTXOArray = this.utxos.map(utxo => utxo.txid);

    const transactionIds = [
      ...new Set([...filteredSpentTXOArray, ...filteredUTXOArray]),
    ];
    console.log(transactionIds);

    const sumsPerTransactionId = {};

    transactionIds.forEach(id => {
      sumsPerTransactionId[id] = this.computeSumForTransactionId(id);
    });
    console.log(sumsPerTransactionId);
    this.transactions = [...this.transactions, ...sumsPerTransactionId];
  }

  computeSumForTransactionId(transactionId) {
    // Filter and sum for LightUTXOs
    console.log('Below');
    const lightSum = this.utxos
      .filter(utxo => utxo.txid === transactionId)
      .reduce((acc, utxo) => acc + utxo.value, 0);

    // Filter and sum for SpentUTXOs (with negative values)
    console.log('Below');
    const spentSum = this.spentTxos
      .filter(utxo => utxo.spent_in === transactionId)
      .reduce((acc, utxo) => acc - utxo.value, 0);

    // todo extract timestamp per transaction as well

    return lightSum + spentSum;
  }

  // todo write test for this. what if order of json keys is different?
  addObjectIfNotExists = (list, obj) => {
    if (!list.some(item => JSON.stringify(item) === JSON.stringify(obj))) {
      list.push(obj);
    }
  };

  computeBalance() {
    let balance = 0;
    for (const utxo of this.utxos) {
      balance += utxo.value;
    }

    return balance;
  }
}
