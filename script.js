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

    const socket = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade/btcusdt');
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
                const sum = Math.round(size * price); // Use Math.round for cleaner integer
                // Format Price nicely maybe? (optional)
                // const formattedPrice = price.toFixed(2); // Example: 2 decimal places
                const text = `Price: ${price} &nbsp;&nbsp;&nbsp; Amount: ${sum.toLocaleString()} &nbsp;&nbsp;&nbsp; Time: ${time}`; // Use &nbsp; for non-breaking spaces

                let bgColor = null;
                let lightText = false;

                // --- Simplified color logic ---
                const isMaker = data.m; // true if maker (sell side in context of buyer=taker)
                const threshold1 = 100000;
                const threshold2 = 300000;
                const threshold3 = 600000;
                const threshold4 = 1000000;

                if (sum >= threshold1) {
                    if (isMaker) { // Sells (Red shades)
                        if (sum < threshold2) bgColor = 'rgb(53, 1, 1)';
                        else if (sum < threshold3) bgColor = 'rgb(101, 2, 2)';
                        else if (sum < threshold4) bgColor = 'rgb(151, 6, 6)';
                        else { bgColor = 'rgb(255, 7, 7)'; lightText = true; }
                    } else { // Buys (Green shades)
                        if (sum < threshold2) bgColor = 'rgb(1, 53, 1)';
                        else if (sum < threshold3) bgColor = 'rgb(2, 101, 2)';
                        else if (sum < threshold4) bgColor = 'rgb(6, 151, 6)';
                        else { bgColor = 'rgb(7, 255, 7)'; lightText = true; }
                    }
                }
                // --- End of simplified color logic ---

                if (bgColor) { // Only update if a color was assigned (i.e., sum >= threshold1)
                    updateElements(text, bgColor, lightText);
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

function updateElements(text, bg, light=false){
    const newData = document.createElement('div');
    newData.classList.add('new-data');
    newData.style.backgroundColor = bg;
    newData.innerHTML = text; // Use innerHTML since text includes &nbsp;

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
