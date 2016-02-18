'use strict';

import {App} from './neutrino'
import {NeutrinoObject, ObjectOptions} from './object'
import {ObjectFactory} from './objectFactory'

export class Data {
    private _factory: ObjectFactory;

    constructor(
        public app: App,
        public dataType: string
    ) {
        this._factory = new ObjectFactory(this.app);
    }

    object(param?: any, opts?: ObjectOptions): Promise<NeutrinoObject> {
        opts = opts || <ObjectOptions>{};

        if (typeof param === 'string') {
            let id: string = <string>param;
            return this._factory.get(id, this.dataType, opts);
        }

        return this._factory.create(param, this.dataType, opts);
    }
}