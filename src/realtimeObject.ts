import {ObjectOptions, NeutrinoObject, ObjectEvents} from "./object";
import {App} from "./neutrino";
import {WebSocketClient, Message, MessageOp} from "./webSocketClient";
import * as diff from 'deep-diff'

export class RealtimeObject extends NeutrinoObject {

    constructor(app: App, id: string, dataType: string, opts: ObjectOptions) {
        super(app, id, dataType, opts, true);
        let webSocketClient: WebSocketClient = new WebSocketClient(this._getApp(), this._getDataType());

        this._setProp('webSocketClient', webSocketClient);

        webSocketClient.onMessage(this._processMessage.bind(this));

        this.on(ObjectEvents.propertyAdded, this._sendUpdate.bind(this));
        this.on(ObjectEvents.propertyChanged, this._sendUpdate.bind(this));
        this.on(ObjectEvents.propertyRemoved, this._sendUpdate.bind(this));
    }

    private _sendUpdate() {
        //TODO: try to optimize this not to send updates to the server when the object was changed from a server message
        this._getWebSocketClient().sendUpdate(this);
    }

    private _processMessage(m: Message) {
        let objDiff = diff.diff(this, m.pld);
        if (!objDiff || (Array.isArray(objDiff) && !objDiff.length)) {
            return;
        }

        if (m.op === MessageOp.update) {
            return this._update(m);
        }
    }

    private _update(m: Message) {
        this._merge(m.pld);
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