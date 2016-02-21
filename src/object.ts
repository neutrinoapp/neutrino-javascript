import {App} from './neutrino'
import * as diff from 'deep-diff'
import * as observejs from 'observe-js'
import * as _ from 'lodash';

const EventEmitter: Emitter = require('eventemitter3');
const ObjectObserver = observejs.ObjectObserver;

export interface ObjectOptions {
    realtime: boolean;
}

export class ObjectEvents {
    static propertyAdded: string = 'property-added';
    static propertyChanged: string = 'property-changed';
    static propertyRemoved: string = 'property-removed';
}

export interface EventData {
    prop: string;
    value: any;
    old: any;
    ev: string;
}

export class NeutrinoObject {
    static _propertyStore: WeakMap<NeutrinoObject, Map<string, any>> = new WeakMap();

    _id: string;

    constructor(app: App, id: string, dataType: string, opts: ObjectOptions, observe: boolean, initial?: any) {
        this._id = id;

        this._setProp('emitter', new EventEmitter());
        this._setProp('observe', observe);
        this._setProp('app', app);
        this._setProp('dataType', dataType);
        this._setProp('opts', opts);

        if (observe) {
            this._initObserve();
        }

        this._suspendUpdates();
        _.extend(this, initial);
        setTimeout(() => this._resumeUpdates());
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
        });
    }

    private _protectStore() {
        if (!NeutrinoObject._propertyStore.has(this)) {
            NeutrinoObject._propertyStore.set(this, new Map());
        }
    }

    emit(ev: string, data: EventData): void {
        this._getEmitter().emit(ev, data, this);
    }

    on(ev: string, cb: (ev: EventData) => void): NeutrinoObject {
        this._getEmitter().on(ev, () => {
            //TODO: dirty hack
            if (this._getProp<boolean>('suspended')) {
                return;
            }

            cb.call(this, arguments);
        });
        return this;
    }

    onChanged(cb: (ev: EventData) => void): void {
        this._getEmitter()
            .on(ObjectEvents.propertyAdded, cb)
            .on(ObjectEvents.propertyRemoved, cb)
            .on(ObjectEvents.propertyChanged, cb);
    }

    _merge(obj: any): NeutrinoObject {
        diff.applyDiff(this, obj, null);
        return this;
    }

    _getEmitter(): Emitter {
        return this._getProp<Emitter>('emitter');
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