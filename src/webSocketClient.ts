import {App} from './neutrino'
import {EventEmitter2} from 'eventemitter2';
import * as autobahn from 'autobahn'
import Utils from './utils';

export class MessageOp {
    static update = 'update';
    static create = 'create';
    static remove = 'delete';
    static read = 'read';
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
    timestamp: number;
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
                s.subscribe(cb.topic, cb.callback, cb.opts)
                    .then(() => console.log('Subscribed to: ' + cb.topic), console.error.bind(console));
            });
        });
    }

    getSession(): Promise<autobahn.Session> {
        return new Promise<autobahn.Session>((resolve) => {
            let interval = setInterval(() => {
                if (this.session) {
                    clearInterval(interval);
                    return resolve(this.session);
                }
            }, 50);
        });
    }

    subscribeToSession(topic: string, cb, opts?: any) {
        opts = opts || {};
        delete opts.realtime; //we do not need this to get to the server anyways

        let callbackWrapped = (e) => {
            if (e.length) {
                let msg: Message = JSON.parse(e[0]);
                return cb(msg);
            }

            return cb(e);
        };

        this._callbacks.push({
            topic: topic,
            callback: callbackWrapped,
            opts: opts
        });

        if (this.session) {
            this.session.subscribe(topic, callbackWrapped, opts);
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
            this.defaultTopic = [this.app.appId].join('.')
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
                initial_retry_delay: 1,
                max_retry_delay: 1
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

    private _buildMessage(op: string, pld: any, dataType: string, opts?: any): Message {
        dataType = dataType || this.dataType;

        let m: Message = <Message>{};
        m.app = this.app.appId;
        m.op = op;
        m.options = _.extend({
            clientId: this.app._uniqueId
        }, opts);
        m.origin = MessageOrigin.client;
        m.pld = pld || {};
        m.token = this.app.token;
        m.type = dataType;
        m.timestamp = new Date().valueOf();

        let topicArgs: string[] = [];
        if (!this.dataType) {
            topicArgs.push(dataType);
        }

        topicArgs.push(m.op);

        if (m.op === MessageOp.update) {
            topicArgs.push(m.pld.id);
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

        connection.getSession().then((s: autobahn.Session) => {
            s.publish(m.topic, [JSON.stringify(m)], {}, publishOpts);
        });
    }

    private _call(op: string, obj: any, dataType?: string, opts?: any): Promise<any> {
        dataType = dataType || this.dataType;

        let msg: Message = this._buildMessage(op, obj, dataType, opts);
        let method;
        if (msg.op === MessageOp.read) {
            method = 'data.read';
        } else if (msg.op === MessageOp.create) {
            method = 'data.create';
        } else if (msg.op === MessageOp.remove) {
            method = 'data.remove';
        } else if (msg.op === MessageOp.update) {
            method = 'data.update';
        }

        let connection = this._getConnection();
        return new Promise<any>((resolve, reject) => {
            return connection.getSession().then((s: autobahn.Session) => {
                s.call(method, [msg]).then(resolve, reject);
            })
        });
    }

    private _buildTopic(...args: string[]): string {
        return [this.defaultTopic].concat(args).join('.');
    }

    onDeleteMessage(cb, opts?: any): WebSocketClient {
        let topicArgs: string[] = [MessageOp.remove];
        if (opts.filter) {
            topicArgs.push(Utils.random());
        }

        opts = _.extend(opts, {
            op: MessageOp.remove
        });

        let topic = this._buildTopic(...topicArgs);
        return this.onMessage(topic, cb, opts);
    }

    onCreateMessage(cb, opts?: any): WebSocketClient {
        let topicArgs: string[] = [MessageOp.create];
        if (opts.filter) {
            topicArgs.push(Utils.random());
        }

        opts = _.extend(opts, {
            op: MessageOp.create
        });

        let topic = this._buildTopic(...topicArgs);
        return this.onMessage(topic, cb, opts);
    }

    onUpdateMessage(cb, id: string, opts?: any): WebSocketClient {
        let topic = this._buildTopic(MessageOp.update, id);
        return this.onMessage(topic, cb);
    }

    onMessage(topic: string, cb, opts?: any): WebSocketClient {
        opts = _.extend(opts, {
            appId: this.app.appId,
            type: this.dataType,
        });

        this._getConnection().subscribeToSession(topic, cb, opts);
        return this;
    }

    sendCreate(obj: any, dataType?: string): void {
        let m = this._buildMessage(MessageOp.create, obj, dataType);
        this._sendMessage(m);
    }

    sendRemove(obj: any, dataType?: string): void {
        let m = this._buildMessage(MessageOp.remove, obj, dataType);
        this._sendMessage(m);
    }

    sendUpdate(obj: any, dataType?: string): void {
        let m = this._buildMessage(MessageOp.update, obj, dataType);
        this._sendMessage(m);
    }

    callRead(obj: any, dataType?: string, opts?: any): Promise<any> {
        return this._call(MessageOp.read, obj, dataType, opts);
    }

    callCreate(obj: any, dataType?: string, opts?: any): Promise<any> {
        return this._call(MessageOp.create, obj, dataType, opts);
    }

    callRemove(obj: any, dataType?: string, opts?: any): Promise<any> {
        return this._call(MessageOp.remove, obj, dataType, opts);
    }

    callUpdate(obj: any, dataType?: string, opts?: any): Promise<any> {
        return this._call(MessageOp.update, obj, dataType, opts);
    }
}