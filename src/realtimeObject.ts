import {ObjectOptions, NeutrinoObject, ObjectEvents, EventData} from "./object";
import {App} from "./neutrino";
import {WebSocketClient, Message, MessageOp} from "./webSocketClient";
import * as diff from 'deep-diff'
import * as _ from 'lodash'

class AutoDrainQueue<T> {
    private _queue: T[] = [];
    private _started: boolean = false;
    private _clearInterval;

    constructor(
        public interval: number,
        private _cb: (item: T, last: boolean) => void
    ) {
        this.start();
    }

    start() {
        this._started = true;

        this._clearInterval = setInterval(() => {
            let queueItems = this._queue.slice();
            this._queue = [];

            queueItems.forEach((item, i, array) => {
                this._cb(item, array.length -1 === i);
            });
        }, this.interval);
    }

    stop() {
        this._started = false;
        clearInterval(this._clearInterval);
    }

    queue(): T[] {
        return this._queue;
    }

    add(item: T) {
        this._queue.push(item);
    }
}

class OperationType {
    static UpdateLocal: string = 'update-local';
    static UpdateRemote: string = 'update-remote';
}

class RealtimeOperation {
    constructor(
        public type: string,
        public payload: any
    ) {

    }
}

export class RealtimeObject extends NeutrinoObject {

    constructor(app: App, id: string, dataType: string, opts: ObjectOptions, initial?: any) {
        super(app, id, dataType, opts, true, initial);
        let webSocketClient: WebSocketClient = new WebSocketClient(this._getApp(), this._getDataType());

        this._setProp('webSocketClient', webSocketClient);
        this._setProp('queue', new AutoDrainQueue<RealtimeOperation>(50, this._processTransaction.bind(this)));
        this._setProp('snapshot', {});

        webSocketClient.onMessage(this._processMessage.bind(this));

        this.on(ObjectEvents.propertyAdded, this._sendUpdate.bind(this));
        this.on(ObjectEvents.propertyChanged, this._sendUpdate.bind(this));
        this.on(ObjectEvents.propertyRemoved, this._sendUpdate.bind(this));
    }

    private _processTransaction(t: RealtimeOperation, last: boolean) {
        this._suspendUpdates();

        if (t.type === OperationType.UpdateLocal) {
            let e: Message = t.payload;

            if (e.op === MessageOp.update) {
                this._merge(e.pld);
            }
        }

        if (last) {
            this._getWebSocketClient().sendUpdate(this);
            setTimeout(this._resumeUpdates.bind(this));
        }
    }

    private _sendUpdate(event) {
        // this._getQueue().add(new RealtimeOperation(
        //     OperationType.UpdateRemote,
        //     event
        // ));
        //TODO: try to optimize this not to send updates to the server when the object was changed from a server message
        this._getWebSocketClient().sendUpdate(this);
    }

    private _processMessage(m: Message) {
        this._suspendUpdates();
        let objDiff = diff.diff(this, m.pld);
        if (!objDiff || (Array.isArray(objDiff) && !objDiff.length)) {
            return;
        }

        if (m.op === MessageOp.update) {
            this._update(m);
        }

        setTimeout(() => this._resumeUpdates());
    }

    private _update(m: Message) {
        //TODO: revise for other operations
        // this._getQueue().add(new RealtimeOperation(
        //     OperationType.UpdateLocal,
        //     m
        // ));
        this._merge(m.pld);
    }

    _getQueue(): AutoDrainQueue<RealtimeOperation> {
        return this._getProp<AutoDrainQueue<RealtimeOperation>>('queue');
    }

    _getWebSocketClient(): WebSocketClient {
        return this._getProp<WebSocketClient>('webSocketClient');
    }

    get(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return resolve(this);
        });
    }

    update(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return resolve(this);
        });
    }

    remove(): Promise<any> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return resolve(this);
        });
        //return this._getHttpClient().delete(this._getDataType(), this._id);
    }

    reset(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return resolve(this);
        });
    }
}