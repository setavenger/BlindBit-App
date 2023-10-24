const bip39 = require('bip39');
const splib = require('../../../lib/lib.js');


(async function () {
  const seed = await bip39.mnemonicToSeed('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
  const {scan, spend} = splib.deriveSilentPaymentKeyPair(seed)

  const address = splib.encodeSilentPaymentAddress(scan, spend, 'tsp', 0)

  console.log("Silent payment address:", address);
  // tsp1qqfqnnv8czppwysafq3uwgwvsc638hc8rx3hscuddh0xa2yd746s7xqh6yy9ncjnqhqxazct0fzh98w7lpkm5fvlepqec2yy0sxlq4j6ccc9c679n

  console.log(scan.getPrivate().toString('hex'))
  // 78e7fd7d2b7a2c1456709d147021a122d2dccaafeada040cc1002083e2833b09

  console.log(spend.getPrivate().toString('hex'))
  // c88567742d5019d7ccc81f6e82cef8ef01997a6a3761cc9166036b580549539b
})()