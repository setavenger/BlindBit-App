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
  const privateKey = bip32.fromSeed(seed)
  const keyPair = ECPair.fromPrivateKey(privateKey.privateKey, {network: network});  // derive private key from seed
  const {address} = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: network
  });

  console.log("Source Address:", address);
  // bcrt1qs7k3knzplrzegwja45suv30584t4ryaf5xwf7f
  console.log("PrivateKey:", privateKey.privateKey.toString('hex'));
  // 864f2a0f1696d41bf1e5878653df39dd8467a1acf2c88cd5183cf09b4a92a7a2 this is currently the correct one
  // afa1f1d207afee740da43290c173e770e15fc298b6bcd8729b5d77dcbd63ced0
})()
