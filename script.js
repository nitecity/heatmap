const symbol = 'BTCUSDT';
const limit = 5;
const url = 'https://fapi.binance.com';
const path = `/fapi/v1/depth?symbol=${symbol}&limit=${limit}`;


async function send(){
    try {
        const response = await fetch(url+path);
        const data = await response.json();
        console.log(data);
    } catch(error){
        console.error('Error: ', error);
    }
}

send()