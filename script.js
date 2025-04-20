const symbol = 'BTCUSDT';
const limit = 1000;
const url = 'https://fapi.binance.com';
const path = `/fapi/v1/depth?symbol=${symbol}&limit=${limit}`;


async function getData(){
  try {
      const response = await fetch(url+path);
      const data = await response.json();
      const asks = data.asks;
      const bids = data.bids;
      design(asks, bids);
      
  } catch(error){
      console.error('Error: ', error);
  }
}

getData()

function design(asks, bids){
  const remapAsks = {};
  const remapBids = {};

  for(let [price, size] of asks){
    price = parseInt(price);
    size = parseFloat(size);

    if (remapAsks[price]){
      remapAsks[price] += size;
    } else {
      remapAsks[price] = size;
    }
  }

  for(let [price,size] of bids){
    price = parseInt(price);
    size = parseFloat(size);

    if (remapBids[price]) {
      remapBids[price] += size;
    } else {
      remapBids[price] = size;
    }
  }

  const resultAsks = Object.entries(remapAsks).map(([key, value]) => [parseInt(key), value]);
  const resultBids = Object.entries(remapBids).map(([key, value]) => [parseInt(key), value]);
  resultAsks.reverse();
  resultBids.reverse();
  
  resultAsks.forEach(([price, size]) => {
    const integer = parseInt(size * price);
    console.log(`Price: ${price} ---- Size: ${integer.toLocaleString()} USDT`);
  });
  console.log('Asks:');
  console.log('Bids:');
  resultBids.forEach(([price, size]) => {
    const integer = parseInt(size * price);
    console.log(`Price: ${price} ---- Size: ${integer.toLocaleString()} USDT`);
  });

}