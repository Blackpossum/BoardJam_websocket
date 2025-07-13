export class CursorUpdateDto {
    /**
  * @param {string} id - UUID of the user
  * @param {string} username - The user’s name
  * @param {{x: number, y: number}} position - The cursor state
   */
    constructor(id, username, position) {
        this.id = id;
        this.username = username;
        this.position = position;
    }
};

export class CursorBulkUpdateDto {
    /**
   * @param {CursorUpdateDto[]} clients - Array of cursor update DTOs
    */
    constructor(clients) {
        this.type = 'cursor_bulk_update';
        this.clients = clients;
    }
}

export class CursorDisconnectDto {
    /**
     * @param {string} id - UUID of the user
     */
    constructor(id) {
        this.type = 'cursor_disconnect';
        this.id = id;
    }
}
