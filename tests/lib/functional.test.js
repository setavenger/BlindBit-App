// import assert from 'assert';
const assert = require('assert');
const bip39 = require('bip39');
import ecc from '../../src/modules/noble_ecc';
const {
  deriveSilentPaymentKeyPair,
  decodeSilentPaymentAddress,
  hashOutpoints,
  createOutputs,
  getFromPublicECKey,
  encodeSilentPaymentAddress,
  createLabeledSilentPaymentAddress,
  scanning,
} = require('../../src/lib/silent-payment-lib/lib');
const elliptic = require('elliptic');
const secp256k1 = new elliptic.ec('secp256k1');
const testVectors = require('./mock-data/send_and_receive_test_vectors.json');

const {
  sumKeysPublic,
  sha256,
  getBytes,
} = require('../../src/lib/silent-payment-lib/utils');

let Buffer = require('buffer/').Buffer;

describe('basic functions from reference', () => {
  // todo needs rethinking
  it('should run', async function () {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const seed = await bip39.mnemonicToSeed(mnemonic);

    console.log(deriveSilentPaymentKeyPair(seed));
  });

  it('should test that silent payment address is correctly decoded', async function () {
    const exampleAddress =
      'sp1qqgste7k9hx0qftg6qmwlkqtwuy6cycyavzmzj85c6qdfhjdpdjtdgqjuexzk6murw56suy3e0rd2cgqvycxttddwsvgxe2usfpxumr70xc9pkqwv';
    const ScanKeyHex =
      '20bcfac5b99e04ad1a06ddfb016ee13582609d60b6291e98d01a9bc9a16c96d4';
    const SpendKeyHex =
      '5cc9856d6f8375350e123978daac200c260cb5b5ae83106cab90484dcd8fcf36';
    const {ScanPubKey, SpendPubKey} = decodeSilentPaymentAddress(
      exampleAddress,
      'sp',
    );

    // results taken from reference Python implementation
    assert.strictEqual(
      ScanPubKey.getPublic().getX().toString('hex'),
      ScanKeyHex,
    );
    assert.strictEqual(
      SpendPubKey.getPublic().getX().toString('hex'),
      SpendKeyHex,
    );
  });
  //  todo test silent payment address encoding

  it('should simple has outpoints test', function () {
    const givenOutpoints = [
      ['f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16', 0],
      ['a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d', 0],
    ];
    const resultHash =
      '210fef5d624db17c965c7597e2c6c9f60ef440c831d149c43567c50158557f12';

    const hash = hashOutpoints(givenOutpoints);
    assert.deepStrictEqual(hash.toString('hex'), resultHash);
  });

  it('should test whether the correct outputs are created', function () {
    const expectedOutputs = [
      ['39a1e5ff6206cd316151b9b34cee4f80bb48ce61adee0a12ce7ff05ea436a1d9', 1.0],
    ];
    const recipients = [
      [
        'sp1qqgste7k9hx0qftg6qmwlkqtwuy6cycyavzmzj85c6qdfhjdpdjtdgqjuexzk6murw56suy3e0rd2cgqvycxttddwsvgxe2usfpxumr70xc9pkqwv',
        1.0,
      ],
    ];
    const inputPrivateKeys = [
      [
        'eadc78165ff1f8ea94ad7cfdc54990738a4c53f6e0507b42154201b8e5dff3b1',
        false,
      ],
      [
        '93f5ed907ad5b2bdbbdcb5d9116ebc0a4e1f92f910d5260237fa45a9408aad16',
        false,
      ],
    ];
    const givenOutpoints = [
      ['f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16', 0],
      ['a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d', 0],
    ];
    const outpoints_hash = hashOutpoints(givenOutpoints);
    const outputs = createOutputs(
      inputPrivateKeys,
      outpoints_hash,
      recipients,
      'sp',
    );
    assert.deepStrictEqual(outputs, expectedOutputs);
  });

  // todo from BIP352
  //  Sending
  //  Ensure taproot outputs are excluded during coin selection if the sender does not have access to the key path private key (unless using H as the taproot internal key)
  //  Ensure the silent payment address is re-derived if inputs are added or removed during RBF
  it('should test all the sending test vectors', function () {
    for (const testVector of testVectors) {
      const comment = testVector.comment;
      console.log('Sending', comment);
      for (const sendingVector of testVector.sending) {
        const given = sendingVector.given;
        const expectedOutputs = sendingVector.expected.outputs;
        const inputPrivateKeys = given.input_priv_keys;
        const recipients = given.recipients;
        const outpointsHash = hashOutpoints(given.outpoints);

        const outputs = createOutputs(
          inputPrivateKeys,
          outpointsHash,
          recipients,
          'sp',
        );

        assert.deepStrictEqual(outputs, expectedOutputs);
      }
    }
  });

  it('should created silent payment address', function () {
    const scanPrivateHex =
      '0f694e068028a717f8af6b9411f9a133dd3565258714cc226594b34db90c1f2c';
    const spendPrivateHex =
      '9d6ad855ce3417ef84e836892e5a56392bfba05fa5d97ccea30e266f540e08b3';
    const expectedAddress =
      'sp1qqgste7k9hx0qftg6qmwlkqtwuy6cycyavzmzj85c6qdfhjdpdjtdgqjuexzk6murw56suy3e0rd2cgqvycxttddwsvgxe2usfpxumr70xc9pkqwv';

    const scanKeyPair = secp256k1.keyFromPrivate(scanPrivateHex);
    const spendKeyPair = secp256k1.keyFromPrivate(spendPrivateHex);

    const addr = encodeSilentPaymentAddress(scanKeyPair, spendKeyPair, 'sp');
    assert.strictEqual(addr, expectedAddress);
  });

  it('should run through all the receiving test cases matching the addresses', function () {
    for (const testVector of testVectors) {
      const comment = testVector.comment;
      console.log('Receiving', comment);
      for (const vector of testVector.receiving) {
        const given = vector.given;
        const expectedAddresses = vector.expected.addresses;

        const scanKeyPair = secp256k1.keyFromPrivate(given.scan_priv_key);
        const spendKeyPair = secp256k1.keyFromPrivate(given.spend_priv_key);

        let generatedAddresses = [];
        const addr = encodeSilentPaymentAddress(
          scanKeyPair,
          spendKeyPair,
          'sp',
        );
        generatedAddresses.push(addr);
        for (const [_, m] of Object.entries(given.labels)) {
          generatedAddresses.push(
            createLabeledSilentPaymentAddress(
              scanKeyPair,
              spendKeyPair,
              m,
              'sp',
            ),
          );
        }

        assert.deepStrictEqual(
          generatedAddresses.sort(),
          expectedAddresses.sort(),
        );
      }
    }
  });

  // todo from BIP352
  //  Receiving
  //  Ensure the public key can be extracted from non-standard P2PKH scriptSigs
  //  Ensure taproot script path spends are included, using the taproot output key (unless H is used as the taproot internal key)
  //  Ensure the scanner can extract the public key from each of the input types supported (e.g. P2WPKH, P2SH-P2WPKH, etc)
  it('should run through all the receiving test cases', function () {
    for (const testVector of testVectors) {
      const comment = testVector.comment;
      console.log('Receiving', comment);
      for (const vector of testVector.receiving) {
        const given = vector.given;
        const expectedAddresses = vector.expected.addresses;

        let outputsToCheck = [];
        for (const pubKey of given.outputs) {
          let key = getFromPublicECKey(Buffer.from(pubKey, 'hex'));
          outputsToCheck.push(key);
        }

        const scanKeyPair = secp256k1.keyFromPrivate(given.scan_priv_key);
        const spendKeyPair = secp256k1.keyFromPrivate(given.spend_priv_key);

        let generatedAddresses = [];
        const addr = encodeSilentPaymentAddress(
          scanKeyPair,
          spendKeyPair,
          'sp',
        );
        generatedAddresses.push(addr);
        for (const [_, m] of Object.entries(given.labels)) {
          generatedAddresses.push(
            createLabeledSilentPaymentAddress(
              scanKeyPair,
              spendKeyPair,
              m,
              'sp',
            ),
          );
        }

        assert.deepStrictEqual(
          generatedAddresses.sort(),
          expectedAddresses.sort(),
        );

        const outpointsHash = hashOutpoints(given.outpoints);

        const keys = [];
        for (const pubKey of given.input_pub_keys) {
          let key = getFromPublicECKey(Buffer.from(pubKey, 'hex'));
          keys.push(key);
        }

        const ASum = sumKeysPublic(keys);
        const addToWallet = scanning(
          scanKeyPair,
          spendKeyPair,
          ASum,
          outpointsHash,
          outputsToCheck,
          given.labels,
        );
        assert.strictEqual(addToWallet.length > 0, true);

        const msg = sha256(Buffer.from('message'));
        const aux = sha256(Buffer.from('random auxiliary data'));

        for (const output of addToWallet) {
          const pubKey = getFromPublicECKey(Buffer.from(output.pub_key, 'hex'));
          const fullPrivkeyBN = spendKeyPair
            .getPrivate()
            .add(secp256k1.keyFromPrivate(output.priv_key_tweak).getPrivate());
          let fullPrivkey = secp256k1.keyFromPrivate(fullPrivkeyBN);
          if (fullPrivkey.getPublic().getY().isOdd()) {
            const newPrivateKeyBN = secp256k1.n.sub(fullPrivkey.getPrivate());
            fullPrivkey = secp256k1.keyFromPrivate(newPrivateKeyBN);
          }
          const signature = ecc.signSchnorr(
            msg,
            fullPrivkey.getPrivate().toArrayLike(Buffer, 'be', 32),
            aux,
          );
          const isValid = ecc.verifySchnorr(
            msg,
            getBytes(pubKey, true),
            signature,
          );
          assert.strictEqual(isValid, true, given.outputs[0]);
        }
      }
    }
  });
});
