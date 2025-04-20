import WebSocket from 'ws';
import chalk from 'chalk';
//const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@depth/btcusdt@aggTrade');
const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade');
socket.onopen = () => {
    console.log('Connected to server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // if (data.e == 'depthUpdate') {
    //     const asks = {};
    //     for (let [key, value] of data.a) {
    //         key = parseInt(key)
    //         value = Number(value);
    //         if (value == 0) continue;

    //         if (asks[key]) {
    //             asks[key] += value;
    //         } else {
    //             asks[key] = value;
    //         }
    //     }

    //     //console.log(Object.keys(asks).length);
        
    //     const bids = {};
    //     for (let [key,value] of data.b){
    //         key = parseInt(key);
    //         value = Number(value);
    //         if (value == 0) continue;

    //         if (bids[key]){
    //             bids[key] += value;
    //         }else {
    //             bids[key] = value;
    //         }
    //     }

    //     console.log('----------------')
    //     console.log('Asks:');
    //     for (const price in asks){
    //         const size = asks[price];
            
    //         console.log(`Price: ${price} ---- Size: ${parseInt(size * price).toLocaleString()} USDT`);
    //     }

    //     console.log('----------------')
    //     console.log('Bids:');
    //     for (const price in bids){
    //         const size = bids[price];
            
    //         console.log(`Price: ${price} ---- Size: ${parseInt(size * price).toLocaleString()} USDT`);
    //     }
    // } else 
       if (data.e == 'aggTrade') {
        const price = parseInt(data.p);
        const size = parseFloat(data.q);
        const time = new Date(data.T).toLocaleTimeString();
        const sum = parseInt(size * price);
        const text = `Price: ${price} ---- Size: ${sum.toLocaleString()} USDT ---- Time: ${time}`;
        if (data.m){
            //console.log('Aggressive Sell');
            if ( sum >= 100000 && sum <= 300000) {
                console.log(chalk.rgb(79, 2, 2).bold(text));
            } else if (sum > 300000 && sum <= 600000) {
                console.log(chalk.rgb(121, 2, 2).bold(text));
            } else if (sum > 600000 && sum <= 1000000) {
                console.log(chalk.rgb(176, 5, 5).bold(text));
            } else if (sum > 1000000) {
                console.log(chalk.rgb(255, 0, 0).bold(text));
            }
            
        }else{
            //console.log('Aggressive Buy');
            if ( sum >= 100000 && sum <= 300000) {
                console.log(chalk.rgb(1, 53, 1).bold(text));
            } else if (sum > 300000 && sum <= 600000) {
                console.log(chalk.rgb(2, 101, 2).bold(text));
            } else if (sum > 600000 && sum <= 1000000) {
                console.log(chalk.rgb(6, 169, 6).bold(text));
            } else if (sum > 1000000) {
                console.log(chalk.rgb(7, 255, 7).bold(text));
            }
        }
        
    }
    //console.log(data);
    

};

socket.onerror = (err) => {
    console.error('WebSocket error:', err);
};
