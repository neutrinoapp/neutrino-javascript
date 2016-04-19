import {ObjectOptions, NeutrinoObject, ObjectEvents} from './object';
import {App} from './neutrino';
import {WebSocketClient} from "./webSocketClient";
import * as diff from 'deep-diff'
import {NeutrinoPlatform} from './platform'
import {Message} from './message';

export class RealtimeObject extends NeutrinoObject {
    constructor(app: App, id: string, dataType: string, opts: ObjectOptions, initial?: any) {
        super(app, id, dataType, opts, true, initial);
        let webSocketClient: WebSocketClient = new WebSocketClient(this._getApp(), this._getDataType());
        this._setProp('webSocketClient', webSocketClient);
        this._setProp('messageHistory', {});

        setTimeout(() => {
            //Delay to avoid any unwanted early events
            webSocketClient.onUpdateMessage(this._processMessage.bind(this), this.id);
            //webSocketClient.onMessage(this._processMessage.bind(this), this.id);

            this.on(ObjectEvents.propertyAdded, this._sendUpdate.bind(this), false);
            this.on(ObjectEvents.propertyChanged, this._sendUpdate.bind(this), false);
            this.on(ObjectEvents.propertyRemoved, this._sendUpdate.bind(this), false);
        });

        NeutrinoPlatform.performMicrotask();
    }

    private _sendUpdate() {
        this._getWebSocketClient().sendUpdate(this, this._getDataType());
    }

    private _processMessage(m: Message) {
        let historyKey = m.op + '_' + m.topic;
        let messageHistory = this._getProp('messageHistory');
        if (messageHistory[historyKey]) {
            var lastMessage = messageHistory[historyKey];
            var lastMessageTimestamp = new Date(lastMessage.timestamp);
            var newMessageTimestamp = new Date(m.timestamp);

            if (newMessageTimestamp < lastMessageTimestamp || newMessageTimestamp === lastMessageTimestamp) {
                return;
            }
        }

        messageHistory[historyKey] = m;

        let objDiff = diff.diff(this, m.pld);
        if (!objDiff || (Array.isArray(objDiff) && !objDiff.length)) {
            return;
        }

        this._updateSuspended(m.pld);
        // this._merge(m.pld);
    }

    private _updateSuspended(data: any) {
        //TODO:
        let updateTimeout = this._getProp<number>('updateTimeout');
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }

        this._suspendUpdates();
        this._merge(data);
        let timeout = setTimeout(() => this._resumeUpdates(), 25);
        this._setProp('updateTimeout', timeout);
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
