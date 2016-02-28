import {ObjectOptions, NeutrinoObject, ObjectEvents, EventData} from "./object";
import {App} from "./neutrino";
import {WebSocketClient, Message, MessageOp} from "./webSocketClient";
import * as diff from 'deep-diff'

export class RealtimeObject extends NeutrinoObject {

    constructor(app: App, id: string, dataType: string, opts: ObjectOptions, initial?: any) {
        super(app, id, dataType, opts, true, initial);
        let webSocketClient: WebSocketClient = new WebSocketClient(this._getApp(), this._getDataType());

        this._setProp('webSocketClient', webSocketClient);

        setTimeout(() => {
            //Delay to avoid any unwanted early events
            webSocketClient.onUpdateMessage(this._processMessage.bind(this), this._id);
            //webSocketClient.onMessage(this._processMessage.bind(this), this._id);

            this.on(ObjectEvents.propertyAdded, this._sendUpdate.bind(this), false);
            this.on(ObjectEvents.propertyChanged, this._sendUpdate.bind(this), false);
            this.on(ObjectEvents.propertyRemoved, this._sendUpdate.bind(this), false);
        });
    }

    private _sendUpdate() {
        this._getWebSocketClient().sendUpdate(this, this._getDataType());
    }

    private _processMessage(m: Message) {
        let objDiff = diff.diff(this, m.pld);
        if (!objDiff || (Array.isArray(objDiff) && !objDiff.length)) {
            return;
        }

        this._updateSuspended(m);
    }

    private _updateSuspended(m: Message) {
        this._suspendUpdates();
        this._update(m);
        setTimeout(() => this._resumeUpdates());
    }

    private _update(m: Message) {
        this._merge(m.pld);
    }

    _getWebSocketClient(): WebSocketClient {
        return this._getProp<WebSocketClient>('webSocketClient');
    }

    get(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return this._getWebSocketClient().callRead({_id: this._id})
                .then((m: Message) => {
                    this._updateSuspended(m);
                    resolve(this);
                }, reject);
        });
    }

    update(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve) => {
            this._getWebSocketClient().sendUpdate(this, this._getDataType());
            return resolve(this);
        });
    }

    remove(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._getWebSocketClient().callRemove({
                _id: this._id
            }).then(() => {
                resolve(this._id)
            }, reject);
        });
    }

    reset(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return this._getWebSocketClient().callRead({_id: this._id})
                .then((m: Message) => {
                    this._suspendUpdates();

                    Object.keys(this).forEach(k => {
                        if (k !== '_id') {
                            delete this[k];
                        }
                    });

                    _.extend(this, m.pld);

                    setTimeout(() => this._resumeUpdates());
                    resolve(this);
                }, reject);
        });
    }
}