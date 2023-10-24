const splib = require('../../../lib/lib.js');
const {sumKeysPublic} = require("../../../lib/utils");
const elliptic = require("elliptic");
const {getFromPublicECKey} = require("../../../lib/lib");
const secp256k1 = new elliptic.ec('secp256k1');


// take from step 2
const receiverScan = "78e7fd7d2b7a2c1456709d147021a122d2dccaafeada040cc1002083e2833b09"
const receiverSpend = "c88567742d5019d7ccc81f6e82cef8ef01997a6a3761cc9166036b580549539b"

const scanKeyPair = secp256k1.keyFromPrivate(receiverScan)
const spendKeyPair = secp256k1.keyFromPrivate(receiverSpend)

// can be taken from step 3
const txId = '996c42434b7a44a8fb9556c6b164af885147a49a6a81f2a5728bb277a44f1037'; // replace this with the actual UTXO txid; will be individual for everyone
const vout = 0; // the index of the output in the UTXO you are spending from; will be individual for everyone

// compute outpoint hash here
const outpointsHash = splib.hashOutpoints([[txId, vout]]) // simple example just uses the Txid and vout directly

// take this from explorer as well
const inputPublicKeys = ['02c9361789a512ab8fbdf34048503bf6574ddce29332064f10829d700277ba171c']

// take this from step 3
const outputsRaw = ['11852c09690e788161439e09a173a7dc7b946e17eb20cbc538f214f41110df53']
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
