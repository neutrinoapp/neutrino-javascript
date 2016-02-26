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
        let objects = arr.map((o: any) => {
            return new RealtimeObject(app, o._id, dataType, null, o);
        });

        let data = app.use(dataType);
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

        var createMany = (elements): Promise<any> => {
            let promises = elements.map(e => {
                return data.object(e, {realtime: true});
            });

            return Promise.all(promises);
        };

        objects.push = function () {
            let elements = Array.from(arguments);
            createMany(elements).then(realtimeItems => {
                Array.prototype.push.call(objects, realtimeItems);
            });
        };

        objects.pop = function () {
            let popped = Array.prototype.pop.call(objects);
            ws.sendRemove({_id: popped._id});
        };

        objects.splice = function () {
            let spliced = Array.prototype.splice.call(this, arguments);
            spliced.forEach((o: any) => {
                ws.sendRemove({_id: o._id});
            });
        };

        objects.unshift = function () {
            let elements = Array.from(arguments);
            createMany(elements).then(realtimeItems => {
                Array.prototype.unshift.call(this, realtimeItems);
            });

            return this.length - elements.length;
        };

        objects.shift = function () {
            let shifted = Array.prototype.shift.call(this, arguments);
            ws.sendRemove({_id: shifted._id});
        };

        objects.remove = function (id: string) {
            let model = {_id: id};
            _.remove(this, model);
            ws.sendRemove(model);
        };

        objects.on = function (ev, cb) {
            objects._emitter.on(ev, cb);
        };

        return <NeutrinoObject[]>objects;
    }
}