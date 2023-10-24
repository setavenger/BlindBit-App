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
  const privateKey = bip32.fromSeed(seed)
  const keyPair = ECPair.fromPrivateKey(privateKey.privateKey, {network: network});  // derive private key from seed

  // requires that address from step 1 which was funded
  const txId = '8a8bfc80b35a2fc59faf79c9c7f4c926e64f2ef4f0fa94e87d2de7bc993b18ae'; // replace this with the actual UTXO txid; will be individual for everyone
  const vout = 1; // the index of the output in the UTXO you are spending from; will be individual for everyone
  const inputValue = 20 * 100_000_000; // replace with actual amount
  const fee = 5000;
  const targetValue = inputValue - fee;

  // compute outpoint hash here
  const outpointsHash = hashOutpoints([[txId, vout]]) // simple example just uses the Txid and vout directly

  // take address from step 2
  // todo currently still uses decimals for amounts, but can probably be removed from the whole process
  // const targetAddressesWithAmount = [['tsp1qqfqnnv8czppwysafq3uwgwvsc638hc8rx3hscuddh0xa2yd746s7xqh6yy9ncjnqhqxazct0fzh98w7lpkm5fvlepqec2yy0sxlq4j6ccc9c679n', 21000210]]
  // const targetAddressesWithAmount = [['tsp1qqwwflmkrn3r47qpafvy72uyffh2vxk5r227tfscdcjcsnvw7glpugqj55w5vpqmklp835kg9qljlu364vd7ptmyphfkxfzj53dgyy7653gf60s9x', 21000210]]
  const targetAddressesWithAmount = [['tsp1qqtxjsnpkgy9xjt0v6fx8m0a79ky3ske285l3jzf9cj33y2tmqspwwqnl0930mye2xn2v0xtny4uqzcvffu95qxfp2vl9kfta5svqv32u8chnyyev', 21000210]]

  // take privateKey from step 1
  const inputPrivateKeys = [['864f2a0f1696d41bf1e5878653df39dd8467a1acf2c88cd5183cf09b4a92a7a2', true]]

  // generate silent payment output
  const outputs = splib.createOutputs(inputPrivateKeys, outpointsHash, targetAddressesWithAmount, 'tsp')

  // Extract the scriptPubKey output
  const scriptPubKey = outputs[0][0];

  const psbt = new bitcoin.Psbt({ network: network });

  psbt.addInput({
        hash: txId,
        index: vout,
        witnessUtxo: {
            // will vary, check in a block explorer to find this information easily
            script: Buffer.from('001487ad1b4c41f8c5943a5dad21c645f43d575193a9','hex'),
            value: 20 * 100_000_000
        },
    });

    psbt.addOutput({
        // add the op codes
        script: Buffer.from('5120'+ scriptPubKey, 'hex'),
        value: targetValue,
    });

    psbt.signInput(0, keyPair);
    // psbt.validateSignaturesOfInput(0);
    psbt.finalizeAllInputs();

    const txHex = psbt.extractTransaction(true).toHex();
    console.log(psbt.extractTransaction().getId())
    console.log("Transaction Hex:", txHex);
})();