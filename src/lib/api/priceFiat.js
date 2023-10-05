/**
 * Returns price as number
 * */
export const getPrice = async () => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    );
    if (!response.ok) {
      console.warn('could not fetch price data');
      // console.log(response);
      // todo think about whether zero is the best to return
      return 0;
    }
    const price = await response.json();
    // console.log(price);

    return await price.bitcoin.usd;
  } catch (error) {
    console.warn(error);
  }
};
