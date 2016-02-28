import {NeutrinoObject} from './object';
import {Message, MessageOp, WebSocketClient} from './webSocketClient'
import {App} from './neutrino'
import {RealtimeObject} from './realtimeObject'
import {EventEmitter2} from 'eventemitter2'
import * as _ from 'lodash'

export class ArrayEvents {
    static add = 'add';
    static remove = 'delete';
    static change = 'change';
}

export class RealtimeArray {
    static make(app: App, dataType: string, arr: any): NeutrinoObject[] {
        let objects = arr.map((o: any) => {
            return new RealtimeObject(app, o._id, dataType, null, o);
        });

        let data = app.use(dataType);
        let ws = objects._ws = new WebSocketClient(app, dataType);
        objects._emitter = new EventEmitter2();

        let findObjectIndex = (m: Message) => {
            let matchPredicate = {_id: m.pld._id};
            let objectIndex = _.findLastIndex(objects, matchPredicate);
            return objectIndex;
        };

        let emitCreate = (item: any) => {
            let evData = {
                value: item,
                ev: ArrayEvents.add
            };

            objects._emitter.emit(ArrayEvents.change, evData, objects);
            objects._emitter.emit(ArrayEvents.add, evData, objects);
        };

        let emitDelete = (item: any) => {
            let evData = {
                value: item,
                ev: ArrayEvents.remove
            };

            objects._emitter.emit(ArrayEvents.change, evData, objects);
            objects._emitter.emit(ArrayEvents.remove, evData, objects);
        };

        ws.onCreateMessage((m: Message) => {
            let objectIndex = findObjectIndex(m);

            if (objectIndex !== -1) {
                return;
            }

            let item = new RealtimeObject(app, m.pld._id, dataType, null, m.pld);
            Array.prototype.push.call(objects, item);
            emitCreate(item);
        });

        ws.onDeleteMessage((m: Message) => {
            let objectIndex = findObjectIndex(m);

            if (objectIndex === -1) {
                return;
            }

            let deletedItem = objects[objectIndex];
            _.remove(objects, {_id: m.pld._id});
            emitDelete(deletedItem);
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
                Array.prototype.push.apply(objects, realtimeItems);
                realtimeItems.forEach(emitCreate);
            });
        };

        objects.pop = function () {
            let popped = Array.prototype.pop.call(objects);
            ws.callRemove({_id: popped._id})
                .then(() => {
                    emitDelete(popped);
                });

            return popped;
        };

        objects.splice = function () {
            let spliced = Array.prototype.splice.call(this, arguments);
            let removePromises = spliced.map((o: any) => {
                return ws.callRemove({_id: o._id});
            });

            Promise.all(removePromises)
                .then((removed: any[]) => {
                    removed.forEach((id: string, index: number) => {
                        emitDelete(spliced[index]);
                    })
                });

            return spliced;
        };

        objects.unshift = function () {
            let elements = Array.from(arguments);
            createMany(elements).then(realtimeItems => {
                Array.prototype.unshift.apply(objects, realtimeItems);
                realtimeItems.forEach(emitDelete);
            });

            return this.length - elements.length;
        };

        objects.shift = function () {
            let shifted = Array.prototype.shift.apply(objects, arguments);
            ws.callRemove({_id: shifted._id});
            emitDelete(shifted);

            return shifted;
        };

        objects.remove = function (id: string) {
            let model = {_id: id};
            let removed = _.remove(this, model);
            return ws.callRemove(model).then(() => {
                let removedObject = _.first(removed);
                emitDelete(removedObject);
                return removedObject;
            });
        };

        objects.on = function (ev, cb) {
            objects._emitter.on(ev, cb);
        };

        return <NeutrinoObject[]>objects;
    }
}