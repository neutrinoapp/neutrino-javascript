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

export class Realms {
    static defaultRealm = 'default';
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
    topic: string;
}

class RealTimeConnection {
    private _callbacks = [];

    constructor(
        public connection?: autobahn.Connection,
        public session?: autobahn.Session
    ) {}

    setSession(s: autobahn.Session) {
        this.session = s;
        setTimeout(() => {
            this._callbacks.forEach(cb => {
                s.subscribe(cb.topic, cb.callback)
                    .then(() => console.log('Subscribed to: ' + cb.topic), console.error.bind(console));
            });
        });
    }

    subscribeToSession(topic: string, cb) {
        let callbackWrapper = (e) => {
            if (e.length) {
                let msg: Message = JSON.parse(e[0]);
                return cb(msg);
            }

            return cb(e);
        };

        this._callbacks.push({
            topic: topic,
            callback: callbackWrapper
        });

        if (this.session) {
            this.session.subscribe(topic, callbackWrapper);
        }
    }
}

const connectionsMap: Map<string, RealTimeConnection> = new Map();

export class WebSocketClient {
    private _emitter: EventEmitter2;

    defaultTopic: string;

    constructor(
        public app: App,
        public dataType?: string
    ) {
        this._emitter = new EventEmitter2();
        this._emitter.setMaxListeners(0);

        if (this.dataType) {
            this.defaultTopic = [this.app.appId, this.dataType].join('.');
        } else {
            //TODO:
        }

        this._handleConnection();
    }

    private _getConnection(): RealTimeConnection {
        return connectionsMap.get(this.app.appId);
    }

    private _handleConnection() {
        if (!connectionsMap.has(this.app.appId)) {
            var conn = new autobahn.Connection({
                url: this.app.realtimeHost,
                realm: Realms.defaultRealm,
                max_retries: -1,
            });

            var realTimeConn = new RealTimeConnection(conn);
            connectionsMap.set(this.app.appId, realTimeConn);

            conn.onopen = (session: autobahn.Session) => {
                console.log('Connection for ' + this.app.appId + ' opened');
                this._getConnection().setSession(session);
            };

            conn.onclose = (): boolean => {
                console.log('Connection for ' + this.app.appId + ' closed');
                return true;
            };

            conn.open();
        }
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

        let topicArgs: string[] = [m.op];
        if (m.op === MessageOp.update) {
            topicArgs.push(m.pld._id);
        }

        m.topic = this._buildTopic(...topicArgs);
        return m;
    }

    private _sendMessage(m: Message): void {
        let connection = this._getConnection();
        let publishOpts: any = {};
        if (m.op === MessageOp.remove || m.op === MessageOp.create) {
            publishOpts.exclude_me = false;
        }

        connection.session.publish(m.topic, [JSON.stringify(m)], publishOpts);
    }

    private _buildTopic(...args: string[]): string {
        return [this.defaultTopic].concat(args).join('.');
    }

    onDeleteMessage(cb): WebSocketClient {
        let topic = this._buildTopic(MessageOp.remove);
        return this.onMessage(topic, cb);
    }

    onCreateMessage(cb): WebSocketClient {
        let topic = this._buildTopic(MessageOp.create);
        return this.onMessage(topic, cb);
    }

    onUpdateMessage(cb, id: string): WebSocketClient {
        let topic = this._buildTopic(MessageOp.update, id);
        return this.onMessage(topic, cb);
    }

    onMessage(topic: string, cb): WebSocketClient {
        this._getConnection().subscribeToSession(topic, cb);
        return this;
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