const aggStartButton = document.getElementById('aggStartButton');
const aggStopButton  = document.getElementById('aggStopButton');
const container      = document.getElementById('container');
const oi             = document.getElementById('oi');
let currentWebSocket = null;

container.addEventListener('click', () => {
    container.classList.toggle('expanded');
});

function startAggTrades() {
    if (currentWebSocket) {
        console.log('Closing existing WebSocket connection.');
        currentWebSocket.close();
    }

    const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade');
    currentWebSocket = socket;

    socket.onopen = () => {
        console.log('Connected to Binance AggTrades stream');
        aggStartButton.disabled = true;
        aggStopButton.disabled = false;
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.p);
            const size = parseFloat(data.q);
            const time = new Date(data.T).toLocaleTimeString('en-US', { hour12: false });
            const sum = Math.round(size * price);

            const tradeData = {
                price: price,
                sum: sum,
                time: time
            };

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
                updateElements(tradeData, bgColor, lightText);
            }
            
        } catch (error) {
            console.error("Error processing message:", error, event.data);
        }
    };

    socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        aggStartButton.disabled = false;
        aggStopButton.disabled = true;
        currentWebSocket = null;
    };

    socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason || 'No reason given');
        aggStartButton.disabled = false;
        aggStopButton.disabled = true;
        currentWebSocket = null;
    };


    setInterval( () => {
        openInterest()
    }, 10000);

}

function stopAggTrades() {
    if (currentWebSocket) {
        currentWebSocket.close();
        console.log('Manually disconnected from server');
    } else {
        console.log('No active WebSocket to stop.');
    }
}

aggStartButton.addEventListener('click', startAggTrades);
aggStopButton.addEventListener('click', stopAggTrades);

aggStartButton.disabled = false;
aggStopButton.disabled = true;

function updateElements(textData, bg, light=false){
    const newData = document.createElement('div');
    newData.classList.add('new-data');
    newData.style.backgroundColor = bg;

    newData.innerHTML = `
        <span class="trade-price">Price: ${textData.price}</span>
        <span class="trade-amount">Amount: ${textData.sum.toLocaleString()} </span>
        <span class="trade-time">Time: ${textData.time}</span>
    `;

    container.prepend(newData);

    if (light) {
        newData.style.color = 'rgb(50, 50, 50)';
    } else {
         newData.style.color = '#e0e0e0';
    }

    const maxElements = 15;
    while(container.children.length > maxElements) {
        container.removeChild(container.lastChild);
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
