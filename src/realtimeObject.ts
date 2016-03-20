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
            webSocketClient.onUpdateMessage(this._processMessage.bind(this), this.id);
            //webSocketClient.onMessage(this._processMessage.bind(this), this.id);

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

        this._merge(m.pld);
    }

    private _updateSuspended(data: any) {
        this._suspendUpdates();
        this._merge(data);
        setTimeout(() => this._resumeUpdates());
    }

    _getWebSocketClient(): WebSocketClient {
        return this._getProp<WebSocketClient>('webSocketClient');
    }

    get(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return this._getWebSocketClient()
                .callRead({id: this.id})
                .then((data: any) => {
                    this._updateSuspended(data);
                    resolve(this);
                }, reject);
        });
    }

    update(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            this._getWebSocketClient()
                .callUpdate(this, null, {notify: true})
                .then(() => {
                    return resolve(this);
                }, reject);
        });
    }

    remove(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._getWebSocketClient()
                .callRemove({id: this.id}, null, {notify: true})
                .then(() => {
                return resolve(this.id)
            }, reject);
        });
    }

    reset(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            return this._getWebSocketClient().callRead({id: this.id})
                .then((m: Message) => {
                    this._suspendUpdates();
                    this._reset(m.pld);
                    setTimeout(() => this._resumeUpdates());
                    resolve(this);
                }, reject);
        });
    }
}