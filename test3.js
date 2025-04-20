import WebSocket from 'ws';

const symbol = 'BTCUSDT'; // Change to your desired symbol (e.g., ETHUSDT, BNBUSDT)
const lowerCaseSymbol = symbol.toLowerCase();
const streamName = `${lowerCaseSymbol}@bookTicker`;
// const streamName = '!bookTicker'; // Uncomment to get data for ALL symbols

// Use port 9443 or 443
const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;
// For combined streams: wss://stream.binance.com:9443/stream?streams=btcusdt@bookTicker/ethusdt@bookTicker

console.log(`Connecting to WebSocket: ${wsUrl}`);

let ws = null; // Variable to hold the WebSocket connection

function connect() {
    ws = new WebSocket(wsUrl);

    ws.on('open', function open() {
        console.log(`Connected to ${streamName}`);
        // You could potentially subscribe to more streams here if using a combined stream
        // Example for combined: ws.send(JSON.stringify({ method: "SUBSCRIBE", params: ["bnbbtc@bookTicker"], id: 1 }));
    });

    ws.on('message', function incoming(data) {
        try {
            const messageString = data.toString('utf8'); // Convert buffer to string
            const tickerData = JSON.parse(messageString);

            // Handle combined stream format if applicable
            if (tickerData.stream && tickerData.data) {
               handleBookTicker(tickerData.data);
            }
            // Handle single stream format
            else if (tickerData.s && tickerData.b && tickerData.a) {
               handleBookTicker(tickerData);
            }
            // Handle potential other message types or filter if necessary
            // else {
            //     console.log('Received non-ticker message:', tickerData);
            // }

        } catch (error) {
            console.error('Error parsing message or processing data:', error);
            console.error('Received data:', data.toString('utf8'));
        }
    });

    ws.on('ping', function ping() {
        // Binance sends pings, respond with pong to keep connection alive
        console.log('Received ping, sending pong.');
        ws.pong();
    });

    ws.on('pong', function pong() {
         console.log('Received pong.'); // Less frequent, but good to know
    });

    ws.on('error', function error(err) {
        console.error(`WebSocket error for ${streamName}:`, err);
        // Connection will likely close, handled by 'close' event
    });

    ws.on('close', function close(code, reason) {
        console.log(`WebSocket closed for ${streamName}. Code: ${code}, Reason: ${reason.toString()}`);
        ws = null; // Ensure we clear the old connection object
        // Implement reconnection logic
        console.log('Attempting to reconnect in 5 seconds...');
        setTimeout(connect, 5000); // Reconnect after 5 seconds
    });
}

function handleBookTicker(ticker) {
     // Now you have the best bid/ask data
     console.log(
        `Symbol: ${ticker.s}, Best Bid: ${ticker.b}, Bid Qty: ${ticker.B}, Best Ask: ${ticker.a}, Ask Qty: ${ticker.A}`
     );
     // --- Add your logic here ---
     // e.g., update a database, feed an algorithm, update UI
}

// Initial connection attempt
connect();

// Optional: Graceful shutdown
process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing WebSocket connection.');
    if (ws) {
        ws.removeAllListeners(); // Prevent automatic reconnection on manual close
        ws.terminate(); // Force close
    }
    process.exit(0);
});