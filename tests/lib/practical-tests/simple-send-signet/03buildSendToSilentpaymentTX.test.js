const bitcoin = require('bitcoinjs-lib');
const {ECPairFactory} = require('ecpair');
import ecc from '../../../../src/modules/noble_ecc';
const bip39 = require('bip39');
const {BIP32Factory} = require('bip32');
const splib = require('../../../../src/lib/silent-payment-lib/lib.js');

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

// Regtest network details
const network = bitcoin.networks.testnet;

// let Buffer = require('buffer/').Buffer;

describe('basic functions from reference', () => {
  it('should run', async function () {
    // Generate consistent private key from mnemonic
    const seed = await bip39.mnemonicToSeed(
      'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo mammal',
    );
    const privateKey = bip32.fromSeed(seed);
    const keyPair = ECPair.fromPrivateKey(privateKey.privateKey, {
      network: network,
    }); // derive private key from seed

    // requires that address from step 1 which was funded
    const txId =
      '416259621d7792a3e1be9ac6fe9c5e3f1532cbd55a87bde19e73ce72a49c6d91'; // replace this with the actual UTXO txid; will be individual for everyone
    const vout = 1; // the index of the output in the UTXO you are spending from; will be individual for everyone
    const inputValue = 900_000; // replace with actual amount
    const fee = 200;
    const targetValue = inputValue - fee;

    // compute outpoint hash here
    const outpointsHash = splib.hashOutpoints([[txId, vout]]); // simple example just uses the Txid and vout directly

    // take address from step 2
    // todo currently still uses decimals for amounts, but can probably be removed from the whole process
    const targetAddressesWithAmount = [
      [
        'tsp1qqfnlnlnwwrcn7x09u0p0fm6l3698pw9s6mzlg6wv99dempzxmz53sqklscmpcwzkcmuvr4s503w220qgslyhfyxln3tqevfllmu6epvrlu5z457e',
        21000210,
      ],
    ];

    // take privateKey from step 1
    const inputPrivateKeys = [
      [
        '864f2a0f1696d41bf1e5878653df39dd8467a1acf2c88cd5183cf09b4a92a7a2',
        true,
      ],
    ];

    // generate silent payment output
    const outputs = splib.createOutputs(
      inputPrivateKeys,
      outpointsHash,
      targetAddressesWithAmount,
      'tsp',
    );

    // Extract the scriptPubKey output
    const scriptPubKey = outputs[0][0];

    const psbt = new bitcoin.Psbt({network: network});

    psbt.addInput({
      hash: txId,
      index: vout,
      witnessUtxo: {
        // will vary, check in a block explorer to find this information easily
        script: Buffer.from(
          '001487ad1b4c41f8c5943a5dad21c645f43d575193a9',
          'hex',
        ),
        value: 900_000,
      },
    });

    psbt.addOutput({
      // add the op codes
      script: Buffer.from('5120' + scriptPubKey, 'hex'),
      value: targetValue,
    });

    psbt.signInput(0, keyPair);
    // psbt.validateSignaturesOfInput(0);
    psbt.finalizeAllInputs();

    const txHex = psbt.extractTransaction(true).toHex();
    console.log(psbt.extractTransaction().getId());
    console.log('Transaction Hex:', txHex);
  });
});
