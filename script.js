const container1 = document.getElementById('container1');
const container2 = document.getElementById('container2');
const markPrice = document.getElementById('markPrice');
const oi = document.getElementById('oi');
const pause = document.getElementById('pause');

let isPaused = false;
let intervalId1 = null;
let intervalId2 = null;
let currentPrice = null;

container1.addEventListener('click', () => {
    container1.classList.toggle('expanded');
});
container2.addEventListener('click', () => {
    container2.classList.toggle('expanded');
});

pause.addEventListener('click', () => {
    if(!isPaused){
        isPaused = true;
        pause.textContent = 'Resume';
        stopInterval();
    }else{
        isPaused = false;
        pause.textContent = 'Pause';
        startInterval();
    }
    
});

function connect() {
    const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade/btcusdt@markPrice@1s');
    socket.onopen = () => {
        console.log('Connected to the Server');
        isPaused = false;
    }

    socket.onmessage = (event) => {
        if (!isPaused) {
            const now = Date.now();
            const data = JSON.parse(event.data);

            if (data.e === 'aggTrade') {
                const price = parseFloat(data.p);
                const size = parseFloat(data.q);
                const time = new Date(data.T).toLocaleTimeString('en-US', { hour12: false });
                const sum = Math.round(size * price);

                let bgColor = null;
                let lightText = false;

                const isMaker = data.m;
                const threshold1 = 100000;

                if (sum >= threshold1) {
                    if (isMaker) {
                        if (sum < 300000) bgColor = 'rgb(53, 1, 1)';
                        else if (sum < 600000) bgColor = 'rgb(101, 2, 2)';
                        else if (sum < 1000000) bgColor = 'rgb(151, 6, 6)';
                        else { bgColor = 'rgb(255, 7, 7)'; lightText = true; }
                    } else {
                        if (sum < 300000) bgColor = 'rgb(1, 53, 1)';
                        else if (sum < 600000) bgColor = 'rgb(2, 101, 2)';
                        else if (sum < 1000000) bgColor = 'rgb(6, 151, 6)';
                        else { bgColor = 'rgb(7, 255, 7)'; lightText = true; }
                    }
                }

                if (bgColor) {
                    updateElement(price, sum, bgColor, 1, time, lightText);
                }

            } else if(data.e === 'markPriceUpdate') {
                currentPrice = parseFloat(data.p);
                markPrice.innerHTML = `Mark Price: <span>${currentPrice.toFixed(2)}</span>`;
            }
            
        }
        

    }

    socket.onerror = (err) => {
        console.log(`Error:\n${err}`);
    }

    socket.onclose = (event) => {
        console.log('Websocket disconnected');
        console.log('Reason: ', event.reason || 'no reason given');
    }

    if (!isPaused) {
        startInterval();
    }
    
}



function updateElement(price, sum, bg, whatContainer, time='', light=false) {
    const newData = document.createElement('div');
    newData.classList.add('new-data');
    newData.style.backgroundColor = bg;

    if(whatContainer == 1){
        newData.innerHTML = `
            <span>Price: ${price}</span>
            <span>Amount: ${sum.toLocaleString()}</span>
            <span>Time: ${time}</span>
        `;

        container1.prepend(newData);

        if (light) {
            newData.style.color = 'rgb(50, 50, 50)';
        } else {
            newData.style.color = '#e0e0e0';
        }

        while(container1.children.length > 15) {
            container1.removeChild(container1.lastChild);
        }

    } else if(whatContainer == 2){
        if (price > currentPrice) {
            newData.innerHTML = `
                <span>Price: ${price.toLocaleString()}</span>
                <span>Amount: ${sum.toLocaleString()} </span>
                <span class="positionType">Short</span>
            `;
        } else if (price < currentPrice) {
            newData.innerHTML = `
                <span>Price: ${price.toLocaleString()}</span>
                <span>Amount: ${sum.toLocaleString()} </span>
                <span class="positionType">Long</span>
            `;
        }
        
        container2.prepend(newData);
        while(container2.children.length > 15) {
            container2.removeChild(container2.lastChild);
        }
    }
    
}

async function openInterest() {
    const symbol = 'BTCUSDT';
    const url = `https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`;
    const response = await fetch(url);
    const data = await response.json();
    const openInt = parseInt(data.openInterest);
    oi.innerHTML = `Open Interest: <span class="oi">${openInt}</span> Contracts`;
}


async function getDepth() {
    const url = 'https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=1000';
    const response = await fetch(url);
    const data = await response.json();
    const asks = data.asks;
    const bids = data.bids;

    const asksObj = {};
    const bidsObj = {};

    asks.forEach((ask) => {
        const price = parseInt(ask[0]);
        const amount = parseFloat(ask[1]);
        if (asksObj[price]) {
            asksObj[price] += amount;
        } else {
            asksObj[price] = amount;
        }
    });

    bids.forEach((bid) => {
        const price = parseInt(bid[0]);
        const amount = parseFloat(bid[1]);
        if (bidsObj[price]) {
            bidsObj[price] += amount;
        } else {
            bidsObj[price] = amount;
        }
    });

    const asksResult = Object.entries(asksObj).map( ([price, amount]) => [parseInt(price), amount] );
    const bidsResult = Object.entries(bidsObj).map( ([price, amount]) => [parseInt(price), amount] );

    const mergeAll = [...asksResult, ...bidsResult];
    const sizeInUSD = mergeAll.map( ([price, size]) => {
        return [price, Math.round(price * size)];
    });

    sizeInUSD.sort( (a,b) => a[1] - b[1] );

    const threshold1 = 500000;
    const threshold2 = 1000000;
    const threshold3 = 2000000;
    const threshold4 = 5000000;

    let bg = null;
    
    sizeInUSD.forEach( ([price, size]) => {
        if      (size >= threshold1 && size < threshold2) bg = 'rgb(255, 251, 3)'; 
        else if (size >= threshold2 && size < threshold3) bg = 'rgb(255, 163, 3)';
        else if (size >= threshold3 && size < threshold4) bg = 'rgb(255, 58, 3)';
        else if (size >= threshold4)                      bg = 'rgb(255, 3, 3)';
        else                                              bg = 'rgb(172, 172, 172)';
        updateElement(price, size, bg, 2);
    });


}

function startInterval(currentPrice){
    if(!intervalId1) {
        intervalId1 = setInterval( () => {
            openInterest();
        }, 5000);
    }

    if(!intervalId2) {
        intervalId2 = setInterval( () => {
            getDepth(currentPrice);
        }, 5000);
    }
    console.log('Intervals and Websocket Resumed');
}

function stopInterval() {
    if (intervalId1) {
        clearInterval(intervalId1);
        intervalId1 = null;
    }

    if (intervalId2) {
        clearInterval(intervalId2);
        intervalId2 = null;
    }
    console.log('Intervals and Websocket Paused');
}

connect();