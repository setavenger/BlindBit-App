const elliptic = require('elliptic');
const secp256k1 = new elliptic.ec('secp256k1');
const bitcoin = require('bitcoinjs-lib');
let Buffer = require('buffer/').Buffer;

function sumKeysPublic(keys) {
  let keysSum = keys[0];
  for (const [index] of keys.entries()) {
    if (index === 0) {
      continue;
    }

    const aSumInterim = keysSum.getPublic().add(keys[index].getPublic());
    keysSum = secp256k1.keyFromPublic(aSumInterim);
  }
  return keysSum;
}

function sumKeysPrivate(keys) {
  let keysSum = keys[0];
  for (const [index] of keys.entries()) {
    if (index === 0) {
      continue;
    }

    const aSumInterim = keysSum.getPrivate().add(keys[index].getPrivate());
    keysSum = secp256k1.keyFromPrivate(aSumInterim);
  }
  return keysSum;
}

const sortBuffer = (a, b) => {
  let len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }
  return a.length - b.length;
};

/**
 * @param {Buffer} buf
 * @return {Buffer}
 * */
function sha256(buf) {
  return bitcoin.crypto.sha256(buf);
}

function getBytes(keyPair, bip340 = true) {
  const publicKey = keyPair.getPublic();
  const x = publicKey.getX().toArray('be', 32); // x-coordinate as a 32-byte array
  if (bip340) {
    return Buffer.from(x);
  }

  if (publicKey.getY().isOdd()) {
    return Buffer.concat([Buffer.from('03', 'hex'), Buffer.from(x)]);
  } else {
    return Buffer.concat([Buffer.from('02', 'hex'), Buffer.from(x)]);
  }
}

module.exports = {sortBuffer, sha256, sumKeysPrivate, sumKeysPublic, getBytes};
