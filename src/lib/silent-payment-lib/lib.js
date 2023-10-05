import {bech32m} from 'bech32';
import {BIP32Factory} from 'bip32';

import elliptic from 'elliptic';
import BN from 'bn.js';
const bitcoin = require('bitcoinjs-lib');
const {sortBuffer, sha256, sumKeysPrivate, getBytes} = require('./utils');
let Buffer = require('buffer/').Buffer;

import ecc from '../../modules/noble_ecc';

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const secp256k1 = new elliptic.ec('secp256k1');

// todo general refactor to use satoshis as unit instead of bitcoin
/**
 * @param {Buffer} seed
 * @returns
 */
function deriveSilentPaymentKeyPair(seed) {
  // Generate a random key pair from seed
  const scan_key = "m/352'/0'/0'/1'/0";
  const spend_key = "m/352'/0'/0'/0'/0";
  const master = bip32.fromSeed(seed);
  const keyPairScan = secp256k1.keyFromPrivate(
    master.derivePath(scan_key).privateKey,
  );
  const keyPairSpend = secp256k1.keyFromPrivate(
    master.derivePath(spend_key).privateKey,
  );

  return {
    scan: keyPairScan,
    spend: keyPairSpend,
  };
}

/**
 * @param {Buffer} data
 * @returns elliptic
 */
function getFromPublicECKey(data) {
  if (data.length === 33) {
    return secp256k1.keyFromPublic(data);
  } else if (data.length === 32) {
    // return secp256k1.keyFromPublic(Buffer.concat([Buffer.from('02', 'hex'), data]))
    const curve = secp256k1.curve;
    const x = curve.pointFromX(data.toString('hex'), false); // Try even y
    if (curve.validate(x)) {
      return secp256k1.keyFromPublic(x);
    }

    const xOdd = curve.pointFromX(data.toString('hex'), true); // Try odd y
    if (curve.validate(xOdd)) {
      return secp256k1.keyFromPublic(xOdd);
    }

    return null; // No valid point found for the given x
  }
}

/**
 * @param {string} address
 * @param {string} hrp
 */
function decodeSilentPaymentAddress(address, hrp = 'tsp') {
  const {version, data} = decode(hrp, address);
  const dataBuf = Buffer.from(data);

  const ScanPubKey = getFromPublicECKey(dataBuf.subarray(0, 33));
  const SpendPubKey = getFromPublicECKey(dataBuf.subarray(33, 66)); // according to BIP352 for v0 one is supposed to ignore everything past the first 66 bytes

  return {ScanPubKey, SpendPubKey};
}

function decode(hrp, addr) {
  const decoded = bech32m.decode(addr, 1023);

  if (decoded.prefix !== hrp) {
    return [null, null];
  }

  const data = bech32m.fromWords(decoded.words.slice(1));
  if (data.length < 2) {
    return {version: null, data: null};
  }

  const version = decoded.words[0];
  if (version > 16) {
    return {version: null, data: null};
  }

  return {version, data};
}

/**
 * {elliptic.EcPair} Scan
 * {elliptic.EcPair} Spend
 * */
function encodeSilentPaymentAddress(scan, spend, hrp = 'tsp', version = 0) {
  const words = bech32m.toWords(
    Buffer.concat([getBytes(scan, false), getBytes(spend, false)]),
  );
  return bech32m.encode(hrp, [version, ...words], 1023);
}

function createLabeledSilentPaymentAddress(
  scan,
  spend,
  m,
  hrp = 'tsp',
  version = 0,
) {
  const GAsKey = secp256k1.keyFromPublic(secp256k1.g);
  const interim = GAsKey.getPublic().mul(m);
  const interimAsKey = secp256k1.keyFromPublic(interim);

  const spendLabeled = spend.getPublic().add(interimAsKey.getPublic());
  const spendLabeledAsKey = secp256k1.keyFromPublic(spendLabeled);

  return encodeSilentPaymentAddress(scan, spendLabeledAsKey, hrp);
}

/**
 * @param {(string|number)[][]} outpoints
 * @return {Buffer}
 */
function hashOutpoints(outpoints) {
  // Concatenate the outpoints
  const concatenatedSimple = outpoints.map(([txid, n]) => {
    const txidBuffer = Buffer.from(txid, 'hex').reverse();
    const nBuffer = Buffer.alloc(4);
    nBuffer.writeUInt32LE(n);
    return Buffer.concat([txidBuffer, nBuffer]);
  });

  const concatenatedSorted = Buffer.concat(
    [...concatenatedSimple].sort(sortBuffer),
  );

  return sha256(concatenatedSorted);
}

function getChangePubKey(scan, spend, inputPrivateKeys, outpointsHash, k) {
  // change_shared_secret = outpoints_hash·a·Ascan
  const aSum = sumKeysPrivate(inputPrivateKeys);
  const outpointsHashBN = new BN(outpointsHash, 16);
  const outpointsHashAsKey = secp256k1.keyFromPrivate(outpointsHashBN);

  const stepOneMult = aSum.getPrivate().mul(outpointsHashAsKey.getPrivate());
  const stepOneMultAsKey = secp256k1.keyFromPrivate(stepOneMult);
  const changeSharedSecretPoint = scan
    .getPublic()
    .mul(stepOneMultAsKey.getPrivate());
  const changeSharedSecret = secp256k1.keyFromPublic(changeSharedSecretPoint);

  // For each change output desired:
  // Let ck = sha256(serP(change_shared_secret) || ser32(k))
  const cK = computeTN(changeSharedSecret, k);
  const GAsKey = secp256k1.keyFromPublic(secp256k1.g);
  const interim = GAsKey.getPublic().mul(cK);
  const interimAsKey = secp256k1.keyFromPublic(interim);

  const AChange = computeAChange(scan, spend);
  // Ck = Achange + ck·G
  const ChangeK = AChange.getPublic().add(interimAsKey.getPublic());
  const ChangeKAsKey = secp256k1.keyFromPublic(ChangeK);
  return ChangeKAsKey.getPublic()
    .getX()
    .toArrayLike(Buffer, 'be', 32)
    .toString('hex');
}

function getChangePubKeyForScanning(scanPriv, spend, tweakAsKey, k) {
  // change_shared_secret = outpoints_hash·a·Ascan
  const changeSharedSecretPoint = tweakAsKey
    .getPublic()
    .mul(scanPriv.getPrivate());
  const changeSharedSecret = secp256k1.keyFromPublic(changeSharedSecretPoint);

  // For each change output desired:
  // Let ck = sha256(serP(change_shared_secret) || ser32(k))
  const cK = computeTN(changeSharedSecret, k);
  const GAsKey = secp256k1.keyFromPublic(secp256k1.g);
  // ck·G
  const interim = GAsKey.getPublic().mul(cK);
  const interimAsKey = secp256k1.keyFromPublic(interim);

  const AChange = computeAChange(scanPriv, spend);
  // Ck = Achange + ck·G
  const ChangeK = AChange.getPublic().add(interimAsKey.getPublic());
  const ChangeKAsKey = secp256k1.keyFromPublic(ChangeK);
  return getBytes(ChangeKAsKey, true).toString('hex');
}
// todo consolidate the two function
function getChangePubKeyForScanningAsKey(scanPriv, spend, tweakAsKey, k) {
  // change_shared_secret = outpoints_hash·a·Ascan
  const changeSharedSecretPoint = tweakAsKey
    .getPublic()
    .mul(scanPriv.getPrivate());
  const changeSharedSecret = secp256k1.keyFromPublic(changeSharedSecretPoint);

  // For each change output desired:
  // Let ck = sha256(serP(change_shared_secret) || ser32(k))
  const cK = computeTN(changeSharedSecret, k);
  const GAsKey = secp256k1.keyFromPublic(secp256k1.g);
  // ck·G
  const interim = GAsKey.getPublic().mul(cK);
  const interimAsKey = secp256k1.keyFromPublic(interim);

  const AChange = computeAChange(scanPriv, spend);
  // Ck = Achange + ck·G
  const ChangeK = AChange.getPublic().add(interimAsKey.getPublic());
  return secp256k1.keyFromPublic(ChangeK);
}

/**
 * @param {(string|boolean)[][]} inputPrivateKeys
 * @param {Buffer} outpointsHash
 * @param {(string|number)[][]} recipients
 * @param {string} hrp
 * */
function createOutputs(
  inputPrivateKeys,
  outpointsHash,
  recipients,
  hrp = 'tsp',
) {
  const G = secp256k1.g;

  const keys = [];
  for (const [, [keyHex, xOnly]] of inputPrivateKeys.entries()) {
    let key = secp256k1.keyFromPrivate(keyHex, 'hex');
    if (key.getPublic().getY().isOdd() && xOnly) {
      const newPrivateKeyBN = secp256k1.n.sub(key.getPrivate());
      key = secp256k1.keyFromPrivate(newPrivateKeyBN);
    }
    keys.push(key);
  }

  const aSum = sumKeysPrivate(keys);

  let silentPaymentGroups = {};
  for (const recipient of recipients) {
    const addr = recipient[0];
    const amount = recipient[1];
    const {ScanPubKey, SpendPubKey} = decodeSilentPaymentAddress(addr, hrp);
    const SpendPubKeyM = SpendPubKey;

    const flag = ScanPubKey.getPublic().getY().isOdd();
    const scanPubKeyAsHex = ScanPubKey.getPublic()
      .getX()
      .toArrayLike(Buffer, 'be', 32)
      .toString('hex');
    const scanPubKeyIndexKey = flag
      ? '03' + scanPubKeyAsHex
      : '02' + scanPubKeyAsHex;

    if (silentPaymentGroups[scanPubKeyIndexKey]) {
      silentPaymentGroups[scanPubKeyIndexKey].push([SpendPubKeyM, amount]);
    } else {
      silentPaymentGroups[scanPubKeyIndexKey] = [[SpendPubKeyM, amount]];
    }
  }

  let outputs = [];
  for (let [scanPubKeyIndexKey, B_m_values] of Object.entries(
    silentPaymentGroups,
  )) {
    let n = 0;
    const scanPubKey = secp256k1.keyFromPublic(scanPubKeyIndexKey, 'hex');
    const outpointsHashBN = new BN(outpointsHash, 16);
    const outpointsHashAsKey = secp256k1.keyFromPrivate(outpointsHashBN);

    const stepOneMult = aSum.getPrivate().mul(outpointsHashAsKey.getPrivate());
    const stepOneMultAsKey = secp256k1.keyFromPrivate(stepOneMult);

    const ecdhSharedSecretPoint = scanPubKey
      .getPublic()
      .mul(stepOneMultAsKey.getPrivate());

    const ecdhSharedSecret = secp256k1.keyFromPublic(ecdhSharedSecretPoint);

    // Sort B_m_values by amount to ensure determinism in the tests
    // Note: the receiver can find the outputs regardless of the ordering, this
    // sorting step is only for testing
    // B_m_values.sort((a, b) => a[1] - b[1]);
    for (let [spendM, amount] of B_m_values) {
      const tN = computeTN(ecdhSharedSecret, n);
      const GAsKey = secp256k1.keyFromPublic(G);
      const interim = GAsKey.getPublic().mul(tN);
      const interimAsKey = secp256k1.keyFromPublic(interim);

      const P_nm = spendM.getPublic().add(interimAsKey.getPublic());
      const P_nmAsKey = secp256k1.keyFromPublic(P_nm);
      const outputPubKey = P_nmAsKey.getPublic()
        .getX()
        .toArrayLike(Buffer, 'be', 32)
        .toString('hex');

      outputs.push([outputPubKey, amount]);
      n += 1;
    }
  }

  return outputs;
}

function computeTN(ecdhSharedSecret, n) {
  let nBuf = Buffer.alloc(4);
  nBuf.writeUInt32BE(n, 0);
  return sha256(Buffer.concat([getBytes(ecdhSharedSecret, false), nBuf]));
}

function computeAChange(scan, spend) {
  // Achange = Aspend + sha256(ser256(ascan))·G
  const GAsKey = secp256k1.keyFromPublic(secp256k1.g);
  const interim = GAsKey.getPublic().mul(
    bitcoin.crypto.sha256(scan.getPrivate()),
  );
  const InterimAsKey = secp256k1.keyFromPublic(interim);
  const AChange = spend.getPublic().add(InterimAsKey.getPublic());
  return secp256k1.keyFromPublic(AChange);
}

/**
 * @param {elliptic} scanPriv
 * @param {elliptic} spendPub
 * @param {(string)[]} tweakData
 * @param {{ [key: string]: string }}  labels
 * @return {{tweaksAsKey: *[], pubKeysToCheck: *[]}}
 * */
function getPubKeysFromTweak(scanPriv, spendPub, tweakData, labels = null) {
  // todo add test for this function to make sure all are found
  let pubKeysToCheck = [];
  let tweaksAsKey = [];
  const n = 0;
  for (const tweak of tweakData) {
    // todo just check both until we find a way to properly handle the even uneven issue
    const tweakAsKeyEven = secp256k1.keyFromPublic(
      Buffer.from('02' + tweak, 'hex'),
    );
    const tweakAsKeyOdd = secp256k1.keyFromPublic(
      Buffer.from('03' + tweak, 'hex'),
    );

    const PnAsKeyEven = getPubKeyBasedOnTweak(
      scanPriv,
      spendPub,
      tweakAsKeyEven,
      n,
    );

    const PnAsKeyOdd = getPubKeyBasedOnTweak(
      scanPriv,
      spendPub,
      tweakAsKeyOdd,
      n,
    );

    const changeEven = getChangePubKeyForScanningAsKey(
      scanPriv,
      spendPub,
      tweakAsKeyEven,
      0,
    );
    const changeOdd = getChangePubKeyForScanningAsKey(
      scanPriv,
      spendPub,
      tweakAsKeyOdd,
      0,
    );

    pubKeysToCheck.push(
      Buffer.from('5120' + getBytes(PnAsKeyEven, true).toString('hex'), 'hex'),
    );
    pubKeysToCheck.push(
      Buffer.from('5120' + getBytes(PnAsKeyOdd, true).toString('hex'), 'hex'),
    );
    pubKeysToCheck.push(
      Buffer.from('5120' + getBytes(changeEven, true).toString('hex'), 'hex'),
    );
    pubKeysToCheck.push(
      Buffer.from('5120' + getBytes(changeOdd, true).toString('hex'), 'hex'),
    );

    tweaksAsKey.push(tweakAsKeyEven);
    tweaksAsKey.push(tweakAsKeyOdd);

    // check for change label

    // todo implement labelling
  }

  return {pubKeysToCheck, tweaksAsKey};
}

function getPubKeyBasedOnTweak(scanPriv, spendPub, tweakAsKey, n) {
  const GAsKey = secp256k1.keyFromPublic(secp256k1.g);

  const ecdhSharedSecretPoint = tweakAsKey
    .getPublic()
    .mul(scanPriv.getPrivate());
  // todo not covered by tests make sure always trying even first works
  const ecdhSharedSecret = secp256k1.keyFromPublic(ecdhSharedSecretPoint);

  const tN = computeTN(ecdhSharedSecret, n);
  const interim = GAsKey.getPublic().mul(tN);
  const interimAsKey = secp256k1.keyFromPublic(interim);

  const Pn = spendPub.getPublic().add(interimAsKey.getPublic());
  return secp256k1.keyFromPublic(Pn);
}

/**
 * @param {elliptic} scanPriv
 * @param {elliptic} spendPub
 * @param {elliptic} tweak
 * @param {(elliptic)[]} outputsToCheck
 * @param {{ [key: string]: string }}  labels
 * */
function scanWithTweak(
  scanPriv,
  spendPub,
  tweak,
  outputsToCheck,
  labels = null,
) {
  // todo can probably be optimized with less EC computations
  const GAsKey = secp256k1.keyFromPublic(secp256k1.g);

  const ecdhSharedSecretPoint = tweak.getPublic().mul(scanPriv.getPrivate());
  const ecdhSharedSecret = secp256k1.keyFromPublic(ecdhSharedSecretPoint);
  let n = 0;

  let wallet = [];
  while (true) {
    let initialN = n; // Save the current value of n

    const tN = computeTN(ecdhSharedSecret, n);
    const interim = GAsKey.getPublic().mul(tN);
    const interimAsKey = secp256k1.keyFromPublic(interim);

    const Pn = spendPub.getPublic().add(interimAsKey.getPublic());
    const PnAsKey = secp256k1.keyFromPublic(Pn);

    for (let output of outputsToCheck) {
      // console.log('change for scanning');
      // console.log('N:', n);
      // console.log(
      //   getChangePubKeyForScanning(scanPriv, spendPub, tweak, n),
      //   'Change',
      // );
      // console.log(getBytes(PnAsKey, true).toString('hex'), 'PN');
      // console.log(getBytes(output, true).toString('hex'), 'Output');

      if (
        getBytes(PnAsKey, true).toString('hex') ===
        getBytes(output, true).toString('hex')
      ) {
        wallet.push({
          pub_key: getBytes(PnAsKey).toString('hex'),
          priv_key_tweak: tN.toString('hex'),
          is_change: false,
        });
        let index = outputsToCheck.indexOf(output);
        if (index > -1) {
          outputsToCheck.splice(index, 1);
        }
        n += 1;
        break;
      } else if (
        getChangePubKeyForScanning(scanPriv, spendPub, tweak, n) ===
        getBytes(output, true).toString('hex')
      ) {
        console.log(
          'matched a change address:',
          getChangePubKeyForScanning(scanPriv, spendPub, tweak, n),
        );
        const tNAsKey = secp256k1.keyFromPrivate(tN);
        const privKeyTweak = tNAsKey
          .getPrivate()
          .add(
            secp256k1
              .keyFromPrivate(
                Buffer.from(
                  bitcoin.crypto.sha256(scanPriv.getPrivate()),
                  'hex',
                ),
              )
              .getPrivate(),
          );
        wallet.push({
          pub_key: getChangePubKeyForScanning(
            scanPriv,
            spendPub,
            tweak,
            n,
          ).toString('hex'),
          priv_key_tweak: privKeyTweak.toString('hex'),
          is_change: true,
        });
        let index = outputsToCheck.indexOf(output);
        if (index > -1) {
          outputsToCheck.splice(index, 1);
        }
        n += 1;
        break;
      } else if (labels && Object.keys(labels).length > 0) {
        const PnNeg = PnAsKey.getPublic().neg();
        const PnAsKeyNeg = secp256k1.keyFromPublic(PnNeg);
        const mGsubPoint = output.getPublic().add(PnAsKeyNeg.getPublic());
        const mGsub = secp256k1.keyFromPublic(mGsubPoint);
        let found = false;
        let PnmAsKey;
        let mG;
        // console.log('sub1');
        // console.log(getBytes(mGsub, false));
        // console.log(labels);

        if (getBytes(mGsub, false).toString('hex') in labels) {
          const PnmPoint = mGsub.getPublic().add(PnAsKey.getPublic());
          PnmAsKey = secp256k1.keyFromPublic(PnmPoint);
          mG = mGsub;
          found = true;
        } else {
          const outputNeg = output.getPublic().neg();
          const outputNegAsKey = secp256k1.keyFromPublic(outputNeg);

          const PnNeg = PnAsKey.getPublic().neg();
          const PnAsKeyNeg = secp256k1.keyFromPublic(PnNeg);
          const mGsubPoint = outputNegAsKey
            .getPublic()
            .add(PnAsKeyNeg.getPublic());
          const mGsub = secp256k1.keyFromPublic(mGsubPoint);
          // console.log('sub2');
          // console.log(getBytes(mGsub, false));
          // console.log(labels);

          if (getBytes(mGsub, false).toString('hex') in labels) {
            const PnmPoint = mGsub.getPublic().add(PnAsKey.getPublic());
            PnmAsKey = secp256k1.keyFromPublic(PnmPoint);
            mG = mGsub;
            found = true;
          }
        }
        if (found) {
          const pubKey = getBytes(PnmAsKey, true).toString('hex');
          const label = labels[getBytes(mG, false).toString('hex')];
          const tNAsKey = secp256k1.keyFromPrivate(tN);
          const interim = tNAsKey
            .getPrivate()
            .add(
              secp256k1.keyFromPrivate(Buffer.from(label, 'hex')).getPrivate(),
            );
          const interimAsKey = secp256k1.keyFromPrivate(interim);

          //
          wallet.push({
            pub_key: pubKey,
            priv_key_tweak: interimAsKey.getPrivate().toString('hex'),
            is_change: false, // todo has to be changed once more labels are actively used for change
          });
        }
      }
      let index = outputsToCheck.indexOf(output);
      if (index > -1) {
        outputsToCheck.splice(index, 1);
      }
    }
    n = initialN; // Reset n to the saved value

    if (outputsToCheck.length === 0) {
      break;
    }
  }
  return wallet;
}

/**
 * @param {elliptic} scanPriv
 * @param {elliptic} spendPub
 * @param {elliptic} ASum
 * @param {Buffer} outpointsHash
 * @param {(elliptic)[]} outputsToCheck
 * @param {{ [key: string]: string }}  labels
 * */
function scanning(
  scanPriv,
  spendPub,
  ASum,
  outpointsHash,
  outputsToCheck,
  labels = null,
) {
  const outpointsHashBN = new BN(outpointsHash, 16);
  const outpointsHashAsKey = secp256k1.keyFromPrivate(outpointsHashBN);

  const tweak = ASum.getPublic().mul(outpointsHashAsKey.getPrivate());
  const tweakAsKey = secp256k1.keyFromPublic(tweak);

  return scanWithTweak(scanPriv, spendPub, tweakAsKey, outputsToCheck, labels);
}

module.exports = {
  deriveSilentPaymentKeyPair,
  decodeSilentPaymentAddress,
  encodeSilentPaymentAddress,
  createLabeledSilentPaymentAddress,
  getFromPublicECKey,
  hashOutpoints,
  createOutputs,
  getPubKeysFromTweak,
  scanning,
  scanWithTweak,
  computeAChange,
  getChangePubKey,
  getChangePubKeyForScanningAsKey,
};
