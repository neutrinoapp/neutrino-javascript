'use strict';

import {App} from './neutrino'
import {NeutrinoObject, ObjectOptions} from './object'
import {HttpClient} from './httpClient'
import * as _ from 'lodash'

export class AjaxObject extends NeutrinoObject {
    constructor(app: App, id: string, dataType: string, opts: ObjectOptions, initial?: any) {
        super(app, id, dataType, opts, false, initial);
        let httpClient: HttpClient = new HttpClient(this._getApp());

        this._setProp('httpClient', httpClient);
    }

    _getHttpClient(): HttpClient {
        return this._getProp<HttpClient>('httpClient');
    }

    _getData(): Promise<any> {
        return this._getHttpClient().get(this._getDataType(), this.id);
    }

    get(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            this._getData()
                .then((obj) => {
                    this._merge(obj);
                    return resolve(this);
                })
                .catch(reject);
        });
    }

    update(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            this._getHttpClient().update(this._getDataType(), this.id, this)
                .then(() => resolve(this))
                .catch(reject);
        });
    }

    remove(): Promise<any> {
        return this._getHttpClient().delete(this._getDataType(), this.id);
    }

    reset(): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            this._getData()
                .then((obj) => {
                    this._reset(obj);
                    return resolve(this);
                })
                .catch(reject);
        });
    }
}