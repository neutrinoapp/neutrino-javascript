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
            webSocketClient.onUpdateMessage(this._processMessage.bind(this));
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
            return resolve(this);
        });
    }

    update(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve) => {
            this._getWebSocketClient().sendUpdate(this, this._getDataType());
            return resolve(this);
        });
    }

    remove(): Promise<string> {
        return new Promise<string>((resolve) => {
            this._getWebSocketClient().sendRemove({
                _id: this._id
            }, this._getDataType());

            return resolve(this._id);
        });
    }

    reset(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return resolve(this);
        });
    }
}