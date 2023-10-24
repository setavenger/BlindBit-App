const splib = require('../../../lib/lib.js');
const {sumKeysPublic, getBytes} = require("../../../lib/utils");
const elliptic = require("elliptic");
const {getFromPublicECKey} = require("../../../lib/lib");
const secp256k1 = new elliptic.ec('secp256k1');


// take from step 2
const receiverScan = "78e7fd7d2b7a2c1456709d147021a122d2dccaafeada040cc1002083e2833b09"
const receiverSpend = "c88567742d5019d7ccc81f6e82cef8ef01997a6a3761cc9166036b580549539b"

const scanKeyPair = secp256k1.keyFromPrivate(receiverScan)
const spendKeyPair = secp256k1.keyFromPrivate(receiverSpend)

// can be taken from step 3
const txId1 = '64acb3538b9d631d93f79df6292dd92be78f03f077aa4d2d8c55c095ee799d1a'; // replace this with the actual UTXO txid; will be individual for everyone
const vout1 = 0; // the index of the output in the UTXO you are spending from; will be individual for everyone
const txId2 = '66e2764bf94f0e1fc73d41cd464ac4d5bd869e69250f5395d4e659fc99a73c50'; // replace this with the actual UTXO txid; will be individual for everyone
const vout2 = 0; // the index of the output in the UTXO you are spending from; will be individual for everyone

// compute outpoint hash here
const outpointsHash = splib.hashOutpoints([[txId1, vout1], [txId2, vout2]]) // simple example just uses the Txid and vout directly

// take this from explorer as well
const inputPublicKeys = ['025f1c13171d2e103b4384db08c926877420d2c402a1d32cfc0e2c3d484f656b8d', '034a2e397dbcd61d087dc98d0c6916f43c0c7291dbf050621b5a19003963eccd64']

// take this from step 3
const outputsRaw = ['37b8fd7216eb4f3f14e3eba1e795f10fcafe7678f2c1b1500c8e0a58d9cd8a45']
let outputsToCheck = []
for (const pubKey of outputsRaw) {
  let key = getFromPublicECKey(Buffer.from(pubKey, 'hex'))
  outputsToCheck.push(key)
}
// no labels in this case
const labels = {}


const keys = []
for (const pubKey of inputPublicKeys) {
  let key = splib.getFromPublicECKey(Buffer.from(pubKey, 'hex'))
  keys.push(key)
}

const ASum = sumKeysPublic(keys)

const addToWallet = splib.scanning(scanKeyPair, spendKeyPair, ASum, outpointsHash, outputsToCheck, labels)
console.log(addToWallet)
