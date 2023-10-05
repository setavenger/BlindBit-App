import splib from '../silent-payment-lib/lib';
const bitcoin = require('../../modules/bitcoinjs-lib/src');
import ecc from '../../modules/noble_ecc';
import {Wallet} from './wallet';
bitcoin.initEccLib(ecc);
const bip39 = require('bip39');

export async function newMnemonic() {
  const buf = await randomBytes(16);
  return bip39.entropyToMnemonic(buf.toString('hex'));
}

export async function walletFromMnemonic(mnemonic, isNew = true) {
  let birthHeight = 0;
  // console.log(mnemonic);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  // console.log(seed);
  const {scan, spend} = splib.deriveSilentPaymentKeyPair(seed);
  if (isNew) {
    const bestBlock = await getBestBlock();
    birthHeight = bestBlock.block_height;
  }

  return new Wallet(scan, spend, mnemonic, birthHeight);
}

export function selectThreeWordsFromMnemonic(mnemonic) {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  shuffle(numbers);

  const uniqueRandomNumbers = numbers.slice(0, 3);
  return {
    word1: {
      index: uniqueRandomNumbers[0] + 1,
      word: mnemonic[uniqueRandomNumbers[0]],
    },
    word2: {
      index: uniqueRandomNumbers[1] + 1,
      word: mnemonic[uniqueRandomNumbers[1]],
    },
    word3: {
      index: uniqueRandomNumbers[2] + 1,
      word: mnemonic[uniqueRandomNumbers[2]],
    },
  };
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

/* From BlueWallet */
import crypto from 'crypto';
import {getBestBlock} from '../api/wallet';
// uses `crypto` module under nodejs/cli and shim under RN
// @see blue_modules/crypto.js

/**
 * Generate cryptographically secure random bytes using native api.
 * @param  {number}   size      The number of bytes of randomness
 * @return {Promise.<Buffer>}   The random bytes
 */
export async function randomBytes(size) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
