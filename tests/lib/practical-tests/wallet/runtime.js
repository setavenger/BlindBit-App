const axios = require('axios');
const {
  scanWithTweak,
  getFromPublicECKey,
  getPubKeysFromTweak
} = require("../../../lib/lib");
const bip39 = require("bip39");
const splib = require("../../../lib/lib");
const {getBytes} = require("../../../lib/utils");

const golomb = require('golomb');

const baseUrl = "http://localhost:8000"
const currentBlock = 107


async function runWallet(scan, spend) {
  const tweakData = await getTweakData(currentBlock)
  const filterResp = await getFilter(currentBlock)

  console.log(tweakData)
  console.log(filterResp)

  const {pubKeysToCheck, tweaksAsKey} = getPubKeysFromTweak(scan, spend, tweakData)

  const filter = golomb.fromNBytes(19, Buffer.from(filterResp['data'], 'hex'))

  const isMatch = filter.matchAny(Buffer.from(filterResp['block_header'], 'hex').reverse(), pubKeysToCheck)
  if (!isMatch) {
    console.log('no matches, try next block')
    return
  } else {
    console.log('found a match')
  }

  const utxos = await getLightUTXOs(currentBlock)
  let outputsToCheck = []
  for (const utxo of utxos) {
    const outputAsKey = getFromPublicECKey(Buffer.from(utxo['scriptpubkey'], 'hex').subarray(2))
    outputsToCheck.push(outputAsKey)
  }
  console.log(getBytes(outputsToCheck[0], false).toString('hex'))
  let matchingScripts = []
  for (const tweakAsKey of tweaksAsKey) {
    let outputsToCheckCopy = [...outputsToCheck]
    const addToWallet = scanWithTweak(scan, spend, tweakAsKey, outputsToCheckCopy)
    matchingScripts.push(addToWallet)
  }
  console.log(matchingScripts)

  let walletUTXOs = []
  // extract outpoint and value for the addToWallet
  for (const scripts of matchingScripts) {
    for (const script of scripts) {
      const matchingData = utxos.filter(obj => obj['scriptpubkey'].slice(4) === script['pub_key']);
      const matchingUTXOData = matchingData[0]
      if (!matchingUTXOData) {
        throw 'no data matched the filter, should not happen!'
      }
      walletUTXOs.push({
        'priv_key_tweak': script['priv_key_tweak'],
        'pub_key': script['pub_key'],
        'txid': matchingUTXOData['txid'],
        'index': matchingUTXOData['index'],
        'value': matchingUTXOData['value']
      })
    }

  }
  console.log(walletUTXOs)
}

async function getTweakData(blockHeight) {
  console.log('fetching tweak data for block:', blockHeight)

  try {
    const response = await axios.get(baseUrl + "/tweak/" + blockHeight);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return "";
  }
}

async function getFilter(blockHeight) {
  console.log('fetching compact filter for block:', blockHeight)

  try {
    const response = await axios.get(baseUrl + "/filter/" + blockHeight);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return "";
  }
}

async function getLightUTXOs(blockHeight) {
  console.log('fetching UTXOs for block:', blockHeight)
  try {
    const response = await axios.get(baseUrl + "/utxos/" + blockHeight);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return "";
  }
}


(async function () {
  const seed = await bip39.mnemonicToSeed('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
  const {scan, spend} = splib.deriveSilentPaymentKeyPair(seed)

  runWallet(scan, spend)
})()