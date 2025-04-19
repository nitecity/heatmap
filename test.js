const WebSocket = require('ws');
const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@depth@500ms');

socket.onopen = () => {
    console.log('Connected to server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const asks = {};
    for (let [key, value] of data.a) {
        key = parseInt(key)
        value = Number(value);
        if (asks[key]) {
            asks[key] += value;
        } else {
            asks[key] = value;
        }
    }

    console.log(Object.keys(asks).length);
    
    const bids = {};
    for (let [key,value] of data.b){
        key = parseInt(key);
        value = Number(value);
        if (bids[key]){
            bids[key] += value;
        }else {
            bids[key] = value;
        }
    }

    console.log('----------------')
    console.log('Asks:');
    for (const prop in asks){
        value = asks[prop];
        
        console.log(`Price: ${prop} ---- Size: ${parseInt(value * prop).toLocaleString()} USDT`);
    }

    console.log('----------------')
    console.log('Bids:');
    for (const prop in bids){
        value = bids[prop];
        
        console.log(`Price: ${prop} ---- Size: ${parseInt(value * prop).toLocaleString()} USDT`);
    }

};

socket.onerror = (err) => {
    console.error('WebSocket error:', err);
};
