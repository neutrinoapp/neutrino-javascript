import {NeutrinoObject} from './object';
import {Message,MessageOp, WebSocketClient} from './webSocketClient';
import {App} from './neutrino'
import {RealtimeObject} from './realtimeObject'
import {EventEmitter2} from 'eventemitter2'
import * as _ from 'lodash'

export class ArrayEvents {
    static add = 'add';
    static remove = 'delete';
}

export class RealtimeArray {
    static make(app: App, dataType: string, arr: any): NeutrinoObject[] {
        let objects = arr.map((o) => {
            return new RealtimeObject(app, o._id, dataType, null, o);
        });

        let ws = objects._ws = new WebSocketClient(app, dataType);
        objects._emitter = new EventEmitter2();

        var findObjectIndex = (m: Message) => {
            let matchPredicate = {_id: m.pld._id};
            let objectIndex = _.findLastIndex(objects, matchPredicate);
            return objectIndex;
        };

        ws.onCreateMessage((m: Message) => {
            let objectIndex = findObjectIndex(m);

            if (objectIndex !== -1) {
                return;
            }

            let item = new RealtimeObject(app, m.pld._id, dataType, null, m.pld);
            Array.prototype.push.call(objects, item);
            let evData = {
                prop: objects.length[0],
                value: item,
                ev: ArrayEvents.add
            };

            objects._emitter.emit('change', evData);
        });

        ws.onDeleteMessage((m: Message) => {
            let objectIndex = findObjectIndex(m);

            if (objectIndex === -1) {
                return;
            }

            let deletedItem = objects[objectIndex];
            _.remove(objects, {_id: m.pld._id});
            let evData = {
                prop: objectIndex,
                value: deletedItem,
                ev: ArrayEvents.remove
            };

            objects._emitter.emit('change', evData)
        });

        objects.push = function () {
            let elements = Array.from(arguments);
            let data = app.use(dataType);
            elements.forEach(e => {
                data.object(e, {realtime: true});
            });
        };

        objects.remove = function (id: string) {
            app.use(dataType).remove(id);
        };

        //TODO: override other array methods

        objects.on = function (ev, cb) {
            objects._emitter.on(ev, cb);
        };

        return <NeutrinoObject[]>objects;
    }
}