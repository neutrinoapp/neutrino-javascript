'use strict';

import NeutrinoData from './data'
import HttpClient from './httpClient'

export default class SimpleNeutrinoData extends NeutrinoData {
    constructor(app, dataType) {
        super(app, dataType);
        this.httpClient = new HttpClient(this.app);
    }

    _getId(param) {
        if (!param) {
            return null;
        }

        return typeof param === 'object' ? param['_id']: param;
    }

    set(id) {

        return new Promise();
    }

    update(id) {
        return new Promise();
    }

    get(id) {
        return this.httpClient.get(this.dataType, this._getId(id));
    }

    create(obj) {
        return this.httpClient.create(this.dataType, obj);
    }

    remove(id) {
        return new Promise();
    }
}
