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

var app = N.app('demo');

describe('Neutrino', function () {
    this.timeout(timeout);
    var accountName = generateRandomString();
    var accountPass = generateRandomString();
    var collectionName = 'demo';

    before(function (done) {
        app.auth
            .register(accountName, accountPass)
            .then(() => app.auth.login(accountName, accountPass))
            .then(() => done());
    });

    after(function (done) {
        var collection = app.collection(collectionName);
        collection
            .delete()
            .then(() => done());
    });

    describe('Data', function () {
        var collection = app.collection(collectionName);
        var data = 'simple test data';

        it('should return test data', function (done) {
            var realtimeObject = collection.create({data: data});
            expect(realtimeObject.data).to.equal(data);
        });
    });

    describe('Events', function () {
        var collection = app.collection(collectionName);
        var data = 'simple test data';

        it('should trigger event on add item', function (done) {
            collection.on(N.ArrayEvents.add, onItemAdded);
            collection.create({data: data});

            function onItemAdded(event, items) {
                expect(event.ev).to.equal(N.ArrayEvents.add);
                expect(event.value.data).to.equal(data);
                removeEventListener(items, N.ArrayEvents.add, onItemAdded);
                done();
            }
        });

        it('should trigger event on item change', function (done) {
            var changedData = 'not simple test data';

            collection.on(N.ArrayEvents.itemChange, onItemChange);
            var realtimeObject = collection.create({data: data});
            realtimeObject.data = changedData;

            function onItemChange(event, item, items) {
                expect(event.ev).to.equal(N.ObjectEvents.propertyChanged);
                expect(item.data).to.equal(changedData);
                removeEventListener(items, N.ArrayEvents.itemChange, onItemChange);
                done();
            }
        });

        it('should trigger event on item remove', function (done) {
            let removedItemId;

            collection.on(N.ArrayEvents.remove, onItemRemove);
            var realtimeObject = collection.create({data: data});
            realtimeObject.delete();
            
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