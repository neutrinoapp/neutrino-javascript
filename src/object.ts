import {App} from './neutrino'
import * as diff from 'deep-diff'
import * as observejs from 'observe-js'
import * as _ from 'lodash';
import {NeutrinoPlatform} from './platform'
import {EventEmitter2} from 'eventemitter2'

const ObjectObserver = observejs.ObjectObserver;
observejs['Observer']['ignoreObjectObserve'](true);

export interface ObjectOptions {
    realtime: boolean;
}

export class ObjectEvents {
    static propertyAdded: string = 'property-added';
    static propertyChanged: string = 'property-changed';
    static propertyRemoved: string = 'property-removed';
    static change: string = 'change';
    static fetch: string = 'fetch';
}

export interface EventData {
    prop: string;
    value: any;
    old: any;
    ev: string;
}

export class NeutrinoObject {
    static _propertyStore: WeakMap<NeutrinoObject, Map<string, any>> = new WeakMap();

    id: string;

    constructor(app: App, id: string, dataType: string, opts: ObjectOptions, observe: boolean, initial?: any) {
        this.id = id;

        let emitter = new EventEmitter2();
        emitter.setMaxListeners(0);

        this._setProp('emitter', emitter);
        this._setProp('observe', observe);
        this._setProp('app', app);
        this._setProp('dataType', dataType);
        this._setProp('opts', opts);
        this._setProp('events', {});

        if (observe) {
            this._initObserve();
        }

        if (initial) {
            this._suspendUpdates();
            _.merge(this, initial);
            NeutrinoPlatform.performMicrotask();
            this._resumeUpdates();
        }
    }

    _suspendUpdates() {
        this._setProp('suspended', true);
    }

    _resumeUpdates() {
        this._setProp('suspended', false);
    }

    private _initObserve() {
        let observer = new ObjectObserver(this);
        observer.open((added: any, removed: any, changed: any, getOld) => {
            this._iterateChanges(ObjectEvents.propertyAdded, added, getOld);
            this._iterateChanges(ObjectEvents.propertyRemoved, removed, getOld);
            this._iterateChanges(ObjectEvents.propertyChanged, changed, getOld);
        });
    }

    private _iterateChanges(event: string, obj: any, getOld) {
        Object.keys(obj).forEach(prop => {
            let evData: EventData = {
                prop: prop,
                value: obj[prop],
                old: getOld(prop),
                ev: event
            };

            this.emit(event, evData);
            this.emit(ObjectEvents.change, evData);
        });
    }

    private _protectStore() {
        if (!NeutrinoObject._propertyStore.has(this)) {
            NeutrinoObject._propertyStore.set(this, new Map());
        }
    }

    emit(ev: string, data?: any): void {
        if (data) {
            this._getEmitter().emit(ev, data, this);
        } else {
            this._getEmitter().emit(ev, this);
        }

    }

    on(ev: string, cb: any, ignoreSuspendFlags?: boolean): NeutrinoObject {
        ignoreSuspendFlags = _.isUndefined(ignoreSuspendFlags) ? true : ignoreSuspendFlags;

        let self = this;

        var eventHandler = function () {
            if (!ignoreSuspendFlags && self._getProp('suspended')) {
                return;
            }

            cb.apply(self, arguments);
        };

        let events = this._getProp('events');
        if (!Array.isArray(events[ev])) {
            events[ev] = [];
        }

        events[ev].push(eventHandler);
        this._getEmitter().on(ev, eventHandler);

        return this;
    }

    off(ev: string, cb: any): NeutrinoObject {
        this._getEmitter().off(ev, cb);
        return this;
    }

    once(ev: string, cb: any): NeutrinoObject {
        this._getEmitter().once(ev, cb);
        return this;
    }

    detach(): NeutrinoObject {
        let events = this._getProp('events');
        for (let ev in events) {
            let handlers = events[ev];
            handlers.forEach((handler) => {
                this.off(ev, handler)
            });
            delete events[ev];
        }

        return this;
    }

    _reset(obj: any): NeutrinoObject {
        Object.keys(this).forEach(k => {
            if (k !== 'id') {
                delete this[k];
            }
        });

        _.merge(this, obj);
        return this;
    }

    _merge(obj: any): NeutrinoObject {
        diff.applyDiff(this, obj, null);
        return this;
    }

    _getEmitter(): EventEmitter2 {
        return this._getProp<EventEmitter2>('emitter');
    }

    _getApp(): App {
        return this._getProp<App>('app');
    }

    _getDataType(): string {
        return this._getProp<string>('dataType');
    }

    _getOpts(): ObjectOptions {
        return this._getProp<ObjectOptions>('opts');
    }

    _getObserve(): boolean {
        return this._getProp<boolean>('observe');
    }

    _getProp<T>(p: string): T {
        this._protectStore();

        let val = NeutrinoObject._propertyStore.get(this).get(p);
        return <T>val;
    }

    _setProp(p: string, v: any) {
        this._protectStore();

        NeutrinoObject._propertyStore.get(this).set(p, v);
    }

    get(): Promise<NeutrinoObject> {
        throw new Error('get must be overridden!');
    }

    update(): Promise<NeutrinoObject> {
        throw new Error('update must be overridden!');
    }

    remove(): Promise<any> {
        throw new Error('remove must be overridden!');
    }

    reset(): Promise<NeutrinoObject> {
        throw new Error('reset must be overridden!');
    }
}