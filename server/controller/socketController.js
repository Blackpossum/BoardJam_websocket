import { WebSocketStatus } from '../constant.js';
import { CursorDisconnectDto } from '../model/cursorUpdateDtos.js';
import { broadcastState } from '../utils/brodcaster.js';


let clients = new Map();
let connections = new Map();

/**
 * Setup socket controller with references to shared state
 * @param {Map} refClients
 * @param {Map} refConnections
 */
export function initSocketController(refClients, refConnections) {
    clients = refClients;
    connections = refConnections;
}

/**
 * Handle incoming message
 * @param {Buffer} bytes
 * @param {string} uuid
 */
export function handleIncomingMessage(bytes, uuid) {
    const message = JSON.parse(bytes.toString());
    const user = clients.get(uuid);

    if (!user) {
        console.warn(`No user found for UUID: ${uuid}`);
        return;
    }

    user.state = {
        x: message.x ?? user.state?.x ?? 0,
        y: message.y ?? user.state?.y ?? 0,
    };

    console.log(`${user.username} moved to`, user.state);
    broadcastState();
}

/**
 * Handle WebSocket close event
 * @param {string} uuid
 */
export function handleCloseConnection(uuid) {
    const session = connections.get(uuid);

    if (session && session.readyState === WebSocketStatus.OPEN) {
        session.close();
    }

    clients.delete(uuid);
    connections.delete(uuid);

    console.log(`Connection closed for UUID: ${uuid}`);

    const disconnectMessage = JSON.stringify(new CursorDisconnectDto(uuid));

    for (const [, session] of connections.entries()) {
        if (session.readyState === WebSocketStatus.OPEN) {
            session.send(disconnectMessage);
        }
    }
}
