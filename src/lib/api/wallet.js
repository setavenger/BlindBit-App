import {makeTorRequest} from './tor';

const baseUrl = 'http://192.168.178.20:8000';

export const getBestBlock = async () => {
  try {
    const response = await fetch(baseUrl + '/block-height/');
    if (!response.ok) {
      console.warn('could not fetch best block data');
      // console.log(response);
      console.log(response.text());
      return;
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const getTweakData = async blockHeight => {
  try {
    const response = await fetch(baseUrl + '/tweak/' + blockHeight);
    if (!response.ok) {
      console.warn('could not fetch tweak data');
      // console.log(response);
    }
    return await response.json();
  } catch (error) {
    console.warn(error);
  }
};

export const getFilter = async blockHeight => {
  try {
    const response = await fetch(baseUrl + '/filter/' + blockHeight);
    if (!response.ok) {
      console.warn('could not fetch filter data');
      // console.log(response);
    }

    return await response.json();
  } catch (error) {
    console.warn(error);
  }
};

export const getFilterTaproot = async blockHeight => {
  try {
    const response = await fetch(baseUrl + '/filter-taproot/' + blockHeight);
    if (!response.ok) {
      console.warn('could not fetch filter data');
      // console.log(response);
    }

    return await response.json();
  } catch (error) {
    console.warn(error);
  }
};

export const getLightUTXOs = async blockHeight => {
  try {
    const response = await fetch(baseUrl + '/utxos/' + blockHeight);
    if (!response.ok) {
      console.warn('could not fetch utxo data');
      // console.log(response);
    }

    return await response.json();
  } catch (error) {
    console.warn(error);
  }
};

export const getSpentUTXOs = async blockHeight => {
  try {
    const response = await fetch(baseUrl + '/utxos-spent/' + blockHeight);
    if (!response.ok) {
      console.warn('could not fetch spent utxo data');
      // console.log(response);
    }

    return await response.json();
  } catch (error) {
    console.warn(error);
  }
};

export const getFeeRecommendation = async () => {
  try {
    const response = await fetch(
      'https://mempool.space/signet/api/v1/fees/recommended', // todo change to prod
    );
    if (!response.ok) {
      console.warn('could not fetch recommended');
    }

    return await response.json();
  } catch (error) {
    console.warn(error);
  }
};

// export async function submitTxHex(txHex) {
//   let success = false;
//   let err = '';
//   try {
//     const response = await fetch(baseUrl + '/forward-tx', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: `data=${encodeURIComponent(txHex)}`, // Properly format the body
//     });
//     console.log('response.ok', response.ok);
//     if (!response.ok) {
//       // todo filter for different kinds of errors
//       success = false;
//       err = 'could not submit transaction, please try later';
//       console.error(err);
//       return {success, err};
//     }
//     success = true;
//     err = '';
//   } catch (e) {
//     console.error('Error:', e);
//     success = false;
//     err = e;
//   }
//
//   console.log('success short before:', success);
//   return {success, err};
// }

export async function submitTxHex(tor, txHex) {
  let success = false;
  let err = '';
  try {
    await makeTorRequest(tor, txHex);
    success = true;
  } catch (e) {
    success = false;
    err = e;
  }

  console.log('success short before:', success);
  return {success, err};
}
