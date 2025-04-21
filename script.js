const aggStartButton = document.getElementById('aggStartButton');
const aggStopButton = document.getElementById('aggStopButton');
const container = document.getElementById('container');
let currentWebSocket = null;

// --- Add this Event Listener for the container ---
container.addEventListener('click', () => {
    container.classList.toggle('expanded');
});
// --- End of added Event Listener ---

function startAggTrades() {
    // Close any existing connection before starting a new one
    if (currentWebSocket) {
        console.log('Closing existing WebSocket connection.');
        currentWebSocket.close();
    }

    const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade');
    currentWebSocket = socket; // Store the new socket

    socket.onopen = () => {
        console.log('Connected to Binance AggTrades stream');
        aggStartButton.disabled = true;
        aggStopButton.disabled = false;
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
    
            if (data.e === 'aggTrade') {
                const price = parseFloat(data.p);
                const size = parseFloat(data.q);
                const time = new Date(data.T).toLocaleTimeString();
                const sum = Math.round(size * price);
    
                // Create an object with the data parts
                const tradeData = {
                    price: price, // Or formattedPrice if you prefer
                    sum: sum,
                    time: time
                };
    
                let bgColor = null;
                let lightText = false;
    
                const isMaker = data.m;
                const threshold1 = 100000;
                // ... rest of your threshold logic ...
    
                if (sum >= threshold1) {
                     if (isMaker) { // Sells (Red shades)
                        // ... set bgColor and lightText ...
                         if (sum < 300000) bgColor = 'rgb(53, 1, 1)';
                         else if (sum < 600000) bgColor = 'rgb(101, 2, 2)';
                         else if (sum < 1000000) bgColor = 'rgb(151, 6, 6)';
                         else { bgColor = 'rgb(255, 7, 7)'; lightText = true; }
                     } else { // Buys (Green shades)
                         // ... set bgColor and lightText ...
                         if (sum < 300000) bgColor = 'rgb(1, 53, 1)';
                         else if (sum < 600000) bgColor = 'rgb(2, 101, 2)';
                         else if (sum < 1000000) bgColor = 'rgb(6, 151, 6)';
                         else { bgColor = 'rgb(7, 255, 7)'; lightText = true; }
                     }
                }
    
                if (bgColor) {
                    // Pass the tradeData object instead of the combined string
                    updateElements(tradeData, bgColor, lightText);
                }
            }
        } catch (error) {
            console.error("Error processing message:", error, event.data);
        }
    };

    socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        // Maybe re-enable buttons here?
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

}

function stopAggTrades() {
    if (currentWebSocket) {
        currentWebSocket.close();
        console.log('Manually disconnected from server');
        // State is updated in the onclose handler
    } else {
        console.log('No active WebSocket to stop.');
    }
}

aggStartButton.addEventListener('click', startAggTrades);
aggStopButton.addEventListener('click', stopAggTrades);

aggStartButton.disabled = false;
aggStopButton.disabled = true;

function updateElements(textData, bg, light=false){ // Renamed first arg for clarity
    const newData = document.createElement('div');
    newData.classList.add('new-data');
    newData.style.backgroundColor = bg;

    // Structure the text with spans
    // Example textData format: { price: 12345.67, sum: 500000, time: "10:30:00 AM" }
    newData.innerHTML = `
        <span class="trade-price">Price: ${textData.price}</span>
        <span class="trade-amount">Amount: ${textData.sum.toLocaleString()} </span>
        <span class="trade-time">Time: ${textData.time}</span>
    `; // Use innerHTML to create spans

    container.prepend(newData);

    if (light) {
        newData.style.color = 'rgb(50, 50, 50)';
    } else {
         newData.style.color = '#e0e0e0';
    }

    const maxElements = 10;
    while(container.children.length > maxElements) {
        container.removeChild(container.lastChild);
    }
}
