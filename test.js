const aggStartButton = document.getElementById('aggStartButton');
// const heatmapStartButton = document.getElementById('heatmapStartButton');
// const aggStopButton = document.getElementById('aggStopButton');
// const heatmapStopButton = document.getElementById('heatmapStopButton');
const container = document.getElementById('container');

// import WebSocket from 'ws';
// import chalk from 'chalk';

function startAggTrades() {
    const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade');
    socket.onopen = () => {
        console.log('Connected to server');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.e == 'aggTrade') {
            const price = parseInt(data.p);
            const size = parseFloat(data.q);
            const time = new Date(data.T).toLocaleTimeString();
            const sum = parseInt(size * price);
            const text = `Price: ${price} **** Size: ${sum.toLocaleString()} USDT **** Time: ${time}`;

            if (data.m){
                const header = 'Aggressive Sell';
                
                if ( sum >= 100000 && sum <= 300000) {
                    const newData = document.createElement('div');
                    newData.innerHTML = header + '<br/>' + text;
                    newData.style.color = 'green';
                    newData.style.fontWeight = 'bold';
                    container.prepend(newData);
                    while(container.children.length > 10) {
                        container.removeChild(container.lastChild);
                    }
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
                
                

                

                

                
            }//else{
            //     const header = chalk.bgGreen.bold('Aggressive Buy');
            //     if ( sum >= 100000 && sum <= 300000) {
            //         console.log(chalk.rgb(1, 53, 1).bold(text));
            //         console.log(header);
            //     } else if (sum > 300000 && sum <= 600000) {
            //         console.log(header);
            //         console.log(chalk.rgb(2, 101, 2).bold(text));
            //     } else if (sum > 600000 && sum <= 1000000) {
            //         console.log(header);
            //         console.log(chalk.rgb(6, 169, 6).bold(text));
            //     } else if (sum > 1000000) {
            //         console.log(header);
            //         console.log(chalk.rgb(7, 255, 7).bold(text));
            //     }
            // }
            
        }
        

    };

    socket.onerror = (err) => {
        console.error('WebSocket error:', err);
    };
}

function stopAggTrades() {
    socket.close();
    console.log('Disconnected from server');
    // html logic here
}

function startHeatmap() {
    getData();
    setInterval(() => {
        getData();
    }, 20000);
}

function stopHeatmap() {
    // stop the heatmap
}

async function getData(){
    const symbol = 'BTCUSDT';
    const limit = 1000;
    const url = 'https://fapi.binance.com';
    const path = `/fapi/v1/depth?symbol=${symbol}&limit=${limit}`;
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
        const sum = parseInt(size * price);
        console.log(`Price: ${price} ---- Size: ${sum.toLocaleString()} USDT`);
    });
    console.log('Asks:');
    console.log('Bids:');
    resultBids.forEach(([price, size]) => {
        const sum = parseInt(size * price);
        console.log(`Price: ${price} ---- Size: ${sum.toLocaleString()} USDT`);
    });

}


//startAggTrades();
//startHeatmap();

aggStartButton.addEventListener('click', (e) => {
    
        startAggTrades();
    // } else if (e.target === aggStopButton) {
    //     stopAggTrades();
    // } else if (e.target === heatmapStartButton) {
    //     startHeatmap();
    // } else if (e.target === heatmapStopButton) {
    //     stopHeatmap();
    // }
});
