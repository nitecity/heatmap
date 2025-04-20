import WebSocket from 'ws';
import chalk from 'chalk';
const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@depth/btcusdt@aggTrade');
//const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade');
socket.onopen = () => {
    console.log('Connected to server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.e == 'depthUpdate') {
        const asks = {};
        for (let [key, value] of data.a) {
            key = parseInt(key)
            value = Number(value);
            if (value == 0) continue;

            if (asks[key]) {
                asks[key] += value;
            } else {
                asks[key] = value;
            }
        }
        
        const bids = {};
        for (let [key,value] of data.b){
            key = parseInt(key);
            value = Number(value);
            if (value == 0) continue;

            if (bids[key]){
                bids[key] += value;
            }else {
                bids[key] = value;
            }
        }

        console.log('----------------')
        console.log(chalk.bgRed.bold('Asks:'));
        
        for (const price in asks){
            const size = asks[price];
            const sum = parseInt(size * price);
            const text = `Price: ${price} ---- Size: ${sum.toLocaleString()} USDT`;
            
            if (sum >= 500000 && sum <= 1000000) {
                console.log(chalk.rgb(52, 0, 0).bold(text));
            } else if (sum > 1000000 && sum <= 2000000) {
                console.log(chalk.rgb(105, 0, 0).bold(text));
            }
            else if (sum > 2000000 && sum <= 3000000) {
                console.log(chalk.rgb(170, 0, 0).bold(text));
            } else if (sum > 3000000) {
                console.log(chalk.rgb(255, 0, 0).bold(text));
            }
        }

        console.log('----------------')
        console.log(chalk.bgGreen.bold('Bids:'));
        for (const price in bids){
            const size = bids[price];
            const sum = parseInt(size * price);
            const text = `Price: ${price} ---- Size: ${sum.toLocaleString()} USDT`;

            if (sum >= 500000 && sum <= 1000000) {
                console.log(chalk.rgb(0, 52, 0).bold(text));
            } else if (sum > 1000000 && sum <= 2000000) {
                console.log(chalk.rgb(0, 105, 0).bold(text));
            }
            else if (sum > 2000000 && sum <= 3000000) {
                console.log(chalk.rgb(0, 170, 0).bold(text));
            } else if (sum > 3000000) {
                console.log(chalk.rgb(0, 255, 0).bold(text));
            }
        }

    } else if (data.e == 'aggTrade') {
        const price = parseInt(data.p);
        const size = parseFloat(data.q);
        const time = new Date(data.T).toLocaleTimeString();
        const sum = parseInt(size * price);
        const text = `Price: ${price} **** Size: ${sum.toLocaleString()} USDT **** Time: ${time}`;

        if (data.m){
            const header = chalk.bgRed.bold('Aggressive Sell');
            if ( sum >= 100000 && sum <= 300000) {
                console.log(header);
                console.log(chalk.rgb(78, 0, 0).bold(text));
            } else if (sum > 300000 && sum <= 600000) {
                console.log(header);
                console.log(chalk.rgb(128, 2, 2).bold(text));
            } else if (sum > 600000 && sum <= 1000000) {
                console.log(header);
                console.log(chalk.rgb(176, 5, 5).bold(text));
            } else if (sum > 1000000) {
                console.log(header);
                console.log(chalk.rgb(255, 0, 0).bold(text));
            }
            
        }else{
            const header = chalk.bgGreen.bold('Aggressive Buy');
            if ( sum >= 100000 && sum <= 300000) {
                console.log(chalk.rgb(1, 53, 1).bold(text));
                console.log(header);
            } else if (sum > 300000 && sum <= 600000) {
                console.log(header);
                console.log(chalk.rgb(2, 101, 2).bold(text));
            } else if (sum > 600000 && sum <= 1000000) {
                console.log(header);
                console.log(chalk.rgb(6, 169, 6).bold(text));
            } else if (sum > 1000000) {
                console.log(header);
                console.log(chalk.rgb(7, 255, 7).bold(text));
            }
        }
        
    }
    

};

socket.onerror = (err) => {
    console.error('WebSocket error:', err);
};
