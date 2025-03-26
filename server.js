const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

server.on('connection', (ws) => {
    ws.send('WebSocket is working on Replit!');
});

console.log('WebSocket server started...');
