
import { WebSocketStatus } from "../constant.js";
import { CursorBulkUpdateDto, CursorUpdateDto } from "../model/cursorUpdateDtos.js";
/**
 * @param {{ [uuid: string]: { username: string, state: {x: number, y: number} } }} clients
 * @param {{ [uuid: string]: WebSocket }} connections
 */
let clients = new Map();
let connections = new Map();

/**
 * Initialize broadcaster with reference maps
 * @param {Map<string, {username: string, state: {x: number, y: number}}>} refClients
 * @param {Map<string, WebSocket>} refConnections
 */
export function initBroadcaster(refClients, refConnections) {
    clients = refClients;
    connections = refConnections;
}

/**
 * Broadcast all client cursor states to all connections
 */
export function broadcastState() {
    const updates = [];

    for (const [uuid, { username, state }] of clients.entries()) {
        updates.push(new CursorUpdateDto(uuid, username, state));
    }

    const message = JSON.stringify(new CursorBulkUpdateDto(updates));

    for (const [uuid, session] of connections.entries()) {
        if (session.readyState === WebSocketStatus.OPEN) {
            session.send(message);
        }
    }
}