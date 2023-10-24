const bitcoin = require('bitcoinjs-lib');
const {ECPairFactory} = require('ecpair');
const ecc = require('tiny-secp256k1');
const bip39 = require('bip39');
const {BIP32Factory} = require("bip32");
const splib = require('../../../lib/lib.js');
const {hashOutpoints} = require("../../../lib/lib");

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

// Regtest network details
const network = bitcoin.networks.regtest;

(async function () {
  // Generate consistent private key from mnemonic
  const seed = await bip39.mnemonicToSeed("zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo mammal");
  const root = bip32.fromSeed(seed, network);

  // Derive the first child key pair using index 0
  const child1 = root.derivePath("m/0'/0/0");
  const keyPair1 = ECPair.fromPrivateKey(child1.privateKey, {network: network});  // derive private key from seed

  // Derive the second child key pair using index 1
  const child2 = root.derivePath("m/0'/0/1");
  const keyPair2 = ECPair.fromPrivateKey(child2.privateKey, {network: network});  // derive private key from seed


  // requires that address from step 1 was funded
  const txId1 = '64acb3538b9d631d93f79df6292dd92be78f03f077aa4d2d8c55c095ee799d1a'; // replace this with the actual UTXO txid; will be individual for everyone
  const vout1 = 0; // the index of the output in the UTXO you are spending from; will be individual for everyone
  const txId2 = '66e2764bf94f0e1fc73d41cd464ac4d5bd869e69250f5395d4e659fc99a73c50'; // replace this with the actual UTXO txid; will be individual for everyone
  const vout2 = 0; // the index of the output in the UTXO you are spending from; will be individual for everyone

  const inputValue = 200_000_000; // replace with actual amount
  const fee = 25000;
  const targetValue = inputValue - fee;

  // compute outpoint hash here
  const outpointsHash = hashOutpoints([[txId1, vout1], [txId2, vout2]]) // simple example just uses the Txid and vout directly

  // take address from step 2
  // todo currently still uses decimals for amounts, but can probably be removed from the whole process
  const targetAddressesWithAmount = [['tsp1qqfqnnv8czppwysafq3uwgwvsc638hc8rx3hscuddh0xa2yd746s7xqh6yy9ncjnqhqxazct0fzh98w7lpkm5fvlepqec2yy0sxlq4j6ccc9c679n', targetValue]]

  // take privateKey from step 1
  const inputPrivateKeys = [['57a675f1c2dd679bbc1ed7d5f6352de80ca08753aa7627a1995066c8dc994efb', false], ['00944355bef8c72b77c45c32ffe085a371135b878d78b05c18fbfe3da38c9569', false]]

  // generate silent payment output
  const outputs = splib.createOutputs(inputPrivateKeys, outpointsHash, targetAddressesWithAmount, 'tsp')

  // Extract the scriptPubKey output
  const scriptPubKey = outputs[0][0];

  const psbt = new bitcoin.Psbt({network: network});

  psbt.addInput({
    hash: txId1,
    index: vout1,
    witnessUtxo: {
      // will vary, check in a block explorer to find this information easily
      script: Buffer.from('00141b82cbb220003030ea1c920d4c49b8cd07fc1815', 'hex'),
      value: 1 * 100_000_000
    },
  });
  psbt.addInput({
    hash: txId2,
    index: vout2,
    witnessUtxo: {
      // will vary, check in a block explorer to find this information easily
      script: Buffer.from('0014812811c9f00c9807b061be24218d37eb26ab48aa', 'hex'),
      value: 1 * 100_000_000
    },
  });

  psbt.addOutput({
    // add the op codes
    script: Buffer.from('5120' + scriptPubKey, 'hex'),
    value: targetValue,
  });

  psbt.signInput(0, keyPair1);
  psbt.signInput(1, keyPair2);

  // psbt.validateSignaturesOfInput(0);
  psbt.finalizeAllInputs();

  const txHex = psbt.extractTransaction(true).toHex();
  console.log("Transaction Hex:", txHex);
})();
