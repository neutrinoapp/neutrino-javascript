import {App} from './neutrino'
import {EventEmitter2} from 'eventemitter2';
import * as autobahn from 'autobahn'

export class MessageOp {
    static update = 'update';
    static create = 'create';
    static remove = 'delete';
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

const webSocketEmitter = new EventEmitter2();
webSocketEmitter.setMaxListeners(0);

const connectionsMap: Map<string, WebSocket> = new Map();

export class WebSocketClient {
    private _connection: WebSocket;

    constructor(
        public app: App
    ) {
        //this._connection = this._handleConnection();
        var conn = new autobahn.Connection({
            url: 'ws://localhost:6000',
            realm: 'default'
        });

        conn.onopen = function (session) {
            debugger;

            session.subscribe('test', function (e) {
                debugger;
            });
        };

        conn.onclose = function () {
            debugger;
        };

        conn.open();
    }

    private _retryConnection() {
        setTimeout(() => {
            console.log('Retrying websocket connection');
            this._connection = this._handleConnection();
        }, 2000);
    }

    private _handleConnection(): WebSocket {
        if (!connectionsMap.has(this.app.appId)) {
            let conn: WebSocket;
            try {
                conn = new WebSocket(this.app.realtimeAppHost);
            } catch (e) {
                return null;
            }

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
                this._retryConnection();
            }
        }

        return connectionsMap.get(this.app.appId);
    }

    private _buildMessage(op: string, pld: any, dataType: string): Message {
        let m: Message = <Message>{};
        m.app = this.app.appId;
        m.op = op;
        m.options = {
            clientId: this.app._uniqueId
        };
        m.origin = MessageOrigin.client;
        m.pld = pld || {};
        m.token = this.app.token;
        m.type = dataType;

        return m;
    }

    private _deferSendMessage(m: Message): void {
        setTimeout(() => {
            this._sendMessage(m);
        }, 500);
    }

    private _sendMessage(m: Message): void {
        if (!this._connection || this._connection.readyState !== WebSocket.OPEN) {
            return this._deferSendMessage(m);
        }

        this._connection.send(JSON.stringify(m));
    }

    on(ev: string, cb, filter?): WebSocketClient {
        webSocketEmitter.on(ev, function (msg) {
            if (!filter) {
                return cb(msg);
            }

            if (filter(msg)) {
                return cb(msg);
            }
        });
        return this;
    }

    emit(ev, data): WebSocketClient {
        webSocketEmitter.emit(ev, data);
        return this
    }

    sendCreate(obj: any, dataType: string): void {
        let m = this._buildMessage(MessageOp.create, obj, dataType);
        this._sendMessage(m);
    }

    sendRemove(obj: any, dataType: string): void {
        let m = this._buildMessage(MessageOp.remove, obj, dataType);
        this._sendMessage(m);
    }

    sendUpdate(obj: any, dataType: string): void {
        let m = this._buildMessage(MessageOp.update, obj, dataType);
        this._sendMessage(m);
    }
}