import {App} from './neutrino'
const EventEmitter: Emitter = require('eventemitter3');

let connectionsMap: Map<string, WebSocket> = new Map();

//{
// "app":"8139ed1ec39a467b96b0250dcf520749",
// "op":"update",
// "options":null,
// "origin":"api",
// "pld":{"_id":"c27dd1a285304bce8e2cb94212f2a0f0","model":"Mitsubishi"},
// "token":"token",
// "type":"car"
//}

export class MessageOp {
    static update = 'update';
    static create = 'create';
    static remove = 'remove';
}

export class MessageOrigin {
    static api = 'api';
    static client = 'client';
}

export interface Message {
    app: string;
    op: string;
    options: any;
    origin: string;
    pld: any;
    token: string;
    type: string;
    raw: any;
}

export class WebSocketClient extends EventEmitter {
    private _connection: WebSocket;

    constructor(
        public app: App,
        public dataType: string
    ) {
        super();
        this._connection = this._handleConnection();
    }

    private _handleConnection(): WebSocket {
        if (!connectionsMap.has(this.app.appId)) {
            let conn = new WebSocket(this.app.realtimeAppHost);
            connectionsMap.set(this.app.appId, conn);

            conn.onerror = (e) => {
                console.log(e);
            };

            conn.onopen = () => {
                console.log('Connection for ' + this.app.appId + ' opened');
            };

            conn.onmessage = (e) => {
                let msg: Message = <Message>JSON.parse(e.data);
                msg.raw = e;
                this.emit('message', msg);
            };

            conn.onclose = () => {
                console.log('Connection for ' + this.app.appId + ' closed');
                connectionsMap.delete(this.app.appId);
            }
        }

        return connectionsMap.get(this.app.appId);
    }

    onMessage(cb: (m: Message) => void) {
        this.on('message', cb);
    }

    sendUpdate(obj: any): void {
        let m: Message = <Message>{};
        m.app = this.app.appId;
        m.op = MessageOp.update;
        m.options = {
            clientId: this.app._uniqueId
        };
        m.origin = MessageOrigin.client;
        m.pld = obj;
        delete m.raw;
        m.token = this.app.token;
        m.type = this.dataType;

        this._connection.send(JSON.stringify(m));
    }
}