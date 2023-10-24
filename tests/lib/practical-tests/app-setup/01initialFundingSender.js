const bitcoin = require('bitcoinjs-lib');
const {ECPairFactory} = require('ecpair');
const ecc = require('tiny-secp256k1');
const bip39 = require('bip39');
const {BIP32Factory} = require("bip32");

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);
// Regtest network details
const network = bitcoin.networks.regtest;

(async function () {
  // todo use proper derivation paths for this test showcase
  const seed = await bip39.mnemonicToSeed("zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo mammal");

  const root = bip32.fromSeed(seed, network);

// Derive the first child key pair using index 0
  const child1 = root.derivePath("m/0'/0/0");
  const {address: address1} = bitcoin.payments.p2wpkh({
    pubkey: child1.publicKey,
    network: network
  });

// Derive the second child key pair using index 1
  const child2 = root.derivePath("m/0'/0/1");
  const {address: address2} = bitcoin.payments.p2wpkh({
    pubkey: child2.publicKey,
    network: network
  });

  console.log("Source pub key:", child1.publicKey.toString('hex'));
  console.log("Source pub key:", child2.publicKey.toString('hex'));
  // Source Address: 025f1c13171d2e103b4384db08c926877420d2c402a1d32cfc0e2c3d484f656b8d
  // Source Address: 034a2e397dbcd61d087dc98d0c6916f43c0c7291dbf050621b5a19003963eccd64

  console.log("Source Address:", address1);
  console.log("Source Address:", address2);
  // Source Address: bcrt1qrwpvhv3qqqcrp6sujgx5cjdce5rlcxq4fx9cwf
  // Source Address: bcrt1qsy5prj0spjvq0vrphcjzrrfhavn2kj92envwx3

  console.log("PrivateKey1:", child1.privateKey.toString('hex'));
  console.log("PrivateKey2:", child2.privateKey.toString('hex'));
  // PrivateKey1: 57a675f1c2dd679bbc1ed7d5f6352de80ca08753aa7627a1995066c8dc994efb
  // PrivateKey2: 00944355bef8c72b77c45c32ffe085a371135b878d78b05c18fbfe3da38c9569
})()
