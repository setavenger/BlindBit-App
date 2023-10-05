// todo convert to production endpoint
const mempoolTor =
  'http://mempoolhqx4isw62xs7abwphsq7ldayuidyx2v2oethdhhj6mlo2r6ad.onion/signet/api/tx';

export const makeTorRequest = async (tor, txHex) => {
  try {
    await tor.stopIfRunning();
  } catch (e) {
    console.warn(e);
  }

  try {
    const resp = await tor.post(mempoolTor, `${encodeURIComponent(txHex)}`, {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    if (resp.respCode !== 200) {
      console.error('could not post transaction');
    }
  } catch (error) {
    throw error;
  }
};

// makeTorRequest();
