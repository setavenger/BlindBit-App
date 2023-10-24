const bitcoin = require('bitcoinjs-lib');
const {ECPairFactory} = require('ecpair');
import ecc from '../../../../src/modules/noble_ecc';
const bip39 = require('bip39');
const {BIP32Factory} = require('bip32');

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);
// Regtest network details
const network = bitcoin.networks.testnet;

describe('basic functions from reference', () => {
  it('should run', async function () {
    const seed = await bip39.mnemonicToSeed(
      'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo mammal',
    );
    const privateKey = bip32.fromSeed(seed);
    const keyPair = ECPair.fromPrivateKey(privateKey.privateKey, {
      network: network,
    }); // derive private key from seed
    const {address} = bitcoin.payments.p2tr({
      pubkey: keyPair.publicKey.subarray(1),
      network: network,
    });

    console.log('Source Address:', address);
    // tb1qs7k3knzplrzegwja45suv30584t4ryafk0hyfq
    console.log('PrivateKey:', privateKey.privateKey.toString('hex'));
    // 864f2a0f1696d41bf1e5878653df39dd8467a1acf2c88cd5183cf09b4a92a7a2
  });
});
