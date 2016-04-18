'use strict';

const timeout = 10000;

var expect;
var N;
var chai;

if (typeof window === 'undefined') {
    chai = require('chai');
    expect = chai.expect;
    N = require('../dist/neutrino.js');
} else {
    expect = chai.expect;
    N = Neutrino;
}

var app = N.app('cf8b71c381ca4eba8b288abdb74810a9');

describe('Neutrino', function () {
    this.timeout(timeout);
    var accountName = generateRandomString();
    var accountPass = generateRandomString();
    var collectionName = 'test';

    before(function (done) {
        app.auth
            .register(accountName, accountPass)
            .then(() => app.auth.login(accountName, accountPass))
            .then(() => done());
    });

    after(function (done) {
        var collection = app.collection(collectionName);
        collection
            .remove()
            .then(() => done());
    });

    describe('Data', function () {
        var collection = app.collection(collectionName);
        var data = 'simple test data';

        it('should return test data', function (done) {
            collection
                .object({data: data})
                .then((item) => {
                    expect(item.data).to.equal(data);
                    done();
                });
        });
    });

    describe('Events', function () {
        var collection = app.collection(collectionName);
        var data = 'simple test data';

        it('should trigger event on add item', function (done) {
            collection
                .objects({ realtime: true })
                .then((items) => {
                    items.on(N.ArrayEvents.add, onItemAdded);
                })
                .then(() => {
                    collection.object({data: data});
                });

            function onItemAdded(event, items) {
                expect(event.ev).to.equal(N.ArrayEvents.add);
                expect(event.value.data).to.equal(data);
                removeEventListener(items, N.ArrayEvents.add, onItemAdded);
                done();
            }
        });

        it('should trigger event on item change', function (done) {
            var changedData = 'not simple test data';

            collection
                .objects({ realtime: true })
                .then((objects) => {
                    objects.on(N.ArrayEvents.itemChange, onItemChange);
                    return objects;
                })
                .then((objects) => {
                    return objects.push({data: data});
                })
                .then((objects) => {
                    return objects[0].data = changedData;
                });

            function onItemChange(event, item, items) {
                expect(event.ev).to.equal(N.ObjectEvents.propertyChanged);
                expect(item.data).to.equal(changedData);
                removeEventListener(items, N.ArrayEvents.itemChange, onItemChange);
                done();
            }
        });

        it('should trigger event on item remove', function (done) {
            let removedItemId;

            collection
                .objects({ realtime: true })
                .then((objects) => {
                    objects.on(N.ArrayEvents.remove, onItemRemove);
                    return objects;
                })
                .then((objects) => {
                    return objects.push({data: data});
                })
                .then((objects) => {
                    removedItemId = objects[0].id;
                    return collection.remove(removedItemId);
                });

            function onItemRemove(event, items) {
                expect(event.ev).to.equal(N.ArrayEvents.remove);
                expect(event.value.id).to.equal(removedItemId);
                removeEventListener(items, N.ArrayEvents.remove, onItemRemove);
                done();
            }
        });
    });
});

function generateRandomString() {
    return Math.random().toString(16).slice(2);
}

function removeEventListener(items, eventType, callback) {
    items.off(eventType, callback);
}