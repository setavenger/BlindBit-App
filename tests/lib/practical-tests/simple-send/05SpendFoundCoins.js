const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const {getBytes} = require("../../../lib/utils");
const elliptic = require("elliptic");
const {ECPairFactory} = require("ecpair");
const secp256k1 = new elliptic.ec('secp256k1');

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const network = bitcoin.networks.regtest;

// take from step 2
const receiverScan = "78e7fd7d2b7a2c1456709d147021a122d2dccaafeada040cc1002083e2833b09"
const receiverSpend = "c88567742d5019d7ccc81f6e82cef8ef01997a6a3761cc9166036b580549539b"

const scanKeyPair = secp256k1.keyFromPrivate(receiverScan)
const spendKeyPair = secp256k1.keyFromPrivate(receiverSpend)

// take this from the output in step 4
const UTXOsInWallet = [{
  pub_key: '9caaa31327730e5fcf53449eeccb8566b8f41936a4cfa5e93754bb02e7ebd39c',
  priv_key_tweak: '9433c2d7439863ec36f6521f75395b8231287a300280617f0e62a175d6d99190'
}]


let fullPrivkey;
for (const output of UTXOsInWallet) {
  const fullPrivkeyBN = spendKeyPair.getPrivate().add(secp256k1.keyFromPrivate(output['priv_key_tweak']).getPrivate())
  fullPrivkey = secp256k1.keyFromPrivate(fullPrivkeyBN)
  if (fullPrivkey.getPublic().getY().isOdd()) {
    const newPrivateKeyBN = secp256k1.n.sub(fullPrivkey.getPrivate())
    fullPrivkey = secp256k1.keyFromPrivate(newPrivateKeyBN)
  }
}

const keyPair = ECPair.fromPrivateKey(fullPrivkey.getPrivate().toArrayLike(Buffer, 'be', 32), {network: network});  // derive private key from seed

const psbt = new bitcoin.Psbt({network: network});

// const txId = 'a6410aab52554da12263c3019594ff01cf729e86910a76962541246c5ee47679'; // replace this with the actual UTXO txid; will be individual for everyone
const txId = '39be622c9f66611558a474517a7317f7c8dc1dbd39a0e6aedcfc90b0cae8f9d6'; // test coinbase transaction directly to old generated bcrt1p4wn3ap9maedxdk9lmpgjerav79sttfv9c6a0jepa9jwuph0ek46q8he38u sending to old address should not happen and users should be discouraged from doing this
const vout = 0; // the index of the output in the UTXO you are spending from; will be individual for everyone
// const inputValue = 99_995_000; // replace with actual amount
const inputValue =  199_975_000; // replace with actual amount

const fee = 5000;
const targetValue = inputValue - fee;

psbt.addInput({
  hash: txId,
  index: vout,
  witnessUtxo: {
    // will vary, check in a block explorer to find this information easily
    script: Buffer.from('51209caaa31327730e5fcf53449eeccb8566b8f41936a4cfa5e93754bb02e7ebd39c', 'hex'),
    // value: 99_995_000
    value:199_975_000
  },
  tapInternalKey: getBytes(fullPrivkey, true),
});

psbt.addOutput({
  // add the op codes
  script: Buffer.from('001487ad1b4c41f8c5943a5dad21c645f43d575193a9', 'hex'),
  value: targetValue,
});


psbt.signInput(0, keyPair);
// psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();

const txHex = psbt.extractTransaction(true).toHex();
console.log("Transaction Hex:", txHex);