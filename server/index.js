import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import url from 'url';
import { handleCloseConnection, handleIncomingMessage, initSocketController } from './controller/socketController.js';
import { broadcastState, initBroadcaster } from './utils/brodcaster.js';

const app = express();

app.use(express.json());
app.get('/', (req, res) => {
    res.send("server is running");
});

const server = createServer(app);
const PORT = 5005;


// initiate instance of websocket
const wss = new WebSocketServer({ server });

const connection = new Map();
const client = new Map();

initSocketController(client, connection);
initBroadcaster(client, connection)

// implementasi lama 

// const broadcast = () => {
//     const users = {};

//     for (const [uuid, { username, state }] of client.entries()) {
//         users[uuid] = { username, position: state };
//     }

//     const message = JSON.stringify({
//         type: 'cursor_bulk_update',
//         clients: users,
//     });

//     for (const [session] of connection.entries()) {
//         if (session.readyState === WebSocket.OPEN) {
//             session.send(message);
//         }
//     }
// };

// const handleMessage = (bytes, uuid) => {
//     const message = JSON.parse(bytes.toString());
//     const user = client.get(uuid);

//     if (!user) {
//         console.warn(`User with UUID ${uuid} not found`);
//         return;
//     }

//     user.state = {
//         x: message.x ?? user.state?.x ?? 0,
//         y: message.y ?? user.state?.y ?? 0
//     };

//     broadcast();

//     console.log(`${user.username} updated their state: ${JSON.stringify(user.state)}`);
// };


wss.on('connection', (session, request) => {
    const { username } = url.parse(request.url, true).query;
    const uuid = uuidv4();

    console.log(`New client connected: ${uuid} (${username})`);

    session.uuid = uuid;
    connection.set(uuid, session);
    client.set(uuid, {
        username,
        state: { x: 0, y: 0 },
    });

    session.on('message', (bytes) => {
        const uuid = session.uuid;
        handleIncomingMessage(bytes, uuid);
    });


    session.on('close', () => {
        const uuid = session.uuid;
        handleCloseConnection(uuid);
    });
});

// start the server
server.listen(PORT, () => {
    console.log(`server is start and running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`ws://localhost:${PORT}`);
});