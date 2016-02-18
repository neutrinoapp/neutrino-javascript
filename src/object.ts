'use strict';

import {App} from './neutrino'
import * as diff from 'deep-diff'

export interface ObjectOptions {
    realtime: boolean;
}

export class NeutrinoObject {
    static _propertyStore: WeakMap<NeutrinoObject, Map<string, any>> = new WeakMap();

    _id: string;

    constructor(app: App, id: string, dataType: string, opts: ObjectOptions) {
        this._id = id;

        this._setProp('app', app);
        this._setProp('dataType', dataType);
        this._setProp('opts', opts);
    }

    private _protectStore() {
        if (!NeutrinoObject._propertyStore.has(this)) {
            NeutrinoObject._propertyStore.set(this, new Map<string, any>());
        }
    }

    _merge(obj: any): NeutrinoObject {
        diff.applyDiff(this, obj, null);
        return this;
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