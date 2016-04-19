import {NeutrinoObject, ObjectEvents} from './object';
import {WebSocketClient} from './webSocketClient'
import {App} from './neutrino'
import {RealtimeObject} from './realtimeObject'
import {EventEmitter2} from 'eventemitter2'
import utils from './utils'
import * as _ from 'lodash'
import {Message} from './message';

export class ArrayEvents {
    static add = 'add';
    static remove = 'delete';
    static change = 'change';
    static itemChange = 'item-change';
}

export class RealtimeArray {
    static make(app: App, dataType: string, arr: any, opts: any): NeutrinoObject[] {
        arr = arr || [];
        let objects = arr.map((o: any) => {
            return new RealtimeObject(app, o.id, dataType, null, o);
        });

        let ws = objects._ws = new WebSocketClient(app, dataType);
        objects._emitter = new EventEmitter2();
        objects._opts = _.clone(opts);
        objects.id = utils.random();

        let findObjectIndex = (id: string) => {
            let matchPredicate = {id: id};
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

        let emitItemChange = (evData: any, object: any) => {
            objects._emitter.emit(ArrayEvents.itemChange, evData, object, objects);
        };

        let subscribeToObject = (obj: RealtimeObject) => {
            obj.on(ObjectEvents.change, emitItemChange, false);
        };

        let unsubscribeFromObject = (obj: RealtimeObject) => {
            obj.off(ObjectEvents.change, emitItemChange);
        };

        objects.forEach((o: RealtimeObject) => subscribeToObject(o));

        let emitDelete = (item: any) => {
            let evData = {
                value: item,
                ev: ArrayEvents.remove
            };

            objects._emitter.emit(ArrayEvents.change, evData, objects);
            objects._emitter.emit(ArrayEvents.remove, evData, objects);
        };

        let addObject = (id: string, initial: any): RealtimeObject => {
            let objectIndex = findObjectIndex(id);

            if (objectIndex !== -1) {
                return objects[objectIndex];
            }

            let item = new RealtimeObject(app, id, dataType, null, initial);
            subscribeToObject(item);
            Array.prototype.push.call(objects, item);
            emitCreate(item);
            return item
        };

        ws.onCreateMessage((m: Message) => {
            addObject(m.pld.id, m.pld);
        }, opts, objects.id);

        ws.onDeleteMessage((m: Message) => {
            let objectIndex = findObjectIndex(m.pld.id);

            if (objectIndex === -1) {
                return;
            }

            let deletedItem = objects[objectIndex];
            deletedItem.detach();
            unsubscribeFromObject(deletedItem);
            _.remove(objects, {id: m.pld.id});
            emitDelete(deletedItem);
        }, opts, objects.id);

        var createMany = (elements): Promise<any> => {
            let promises = elements.map(e => {
                return ws.callCreate(e)
                    .then(id => {
                        return addObject(id, e);
                    })
            });

            return Promise.all(promises);
        };

        objects.push = function () {
            let elements = Array.from(arguments);
            return createMany(elements);
        };

        objects.pop = function () {
            let popped = Array.prototype.pop.call(objects);
            ws.callRemove({id: popped.id})
                .then(() => {
                    emitDelete(popped);
                });

            return popped;
        };

        objects.splice = function () {
            let spliced = Array.prototype.splice.call(this, arguments);
            let removePromises = spliced.map((o: any) => {
                return ws.callRemove({id: o.id});
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
            ws.callRemove({id: shifted.id});
            emitDelete(shifted);

            return shifted;
        };

        objects.remove = function (id: string) {
            let model = {id: id};
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

        objects.off = function (ev, cb) {
            objects._emitter.off(ev, cb);
        };

        return <NeutrinoObject[]>objects;
    }
}