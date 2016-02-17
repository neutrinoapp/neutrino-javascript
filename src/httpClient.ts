'use strict';

import * as Client from 'axios'
import {App} from './neutrino'

interface HttpHeaders {
    Authorization?: string;
}

interface RequestOptions {
    method: string;
    url: string;
    headers: HttpHeaders;
    data?: {};
}

export class HttpClient {
    constructor(
        public app: App
    ) {}

    _buildRequest(urls: string[], method: string, data: any, optionalHeaders?: any): Promise<any> {
        let path = urls.join('/');
        let headers: HttpHeaders = {};

        Object.assign(headers, optionalHeaders);

        if (this.app.token) {
            headers.Authorization = 'Bearer ' + this.app.token;
        }

        let requestOptions: RequestOptions = {
            method: method,
            url: this.app.appHost + path,
            headers: headers
        };

        if (data) {
            requestOptions.data = data;
        }

        return new Promise((resolve, reject) => {
            Client(requestOptions)
                .then((res: any) => {
                    res.data = res.data || {};
                    return resolve(res);
                })
                .catch(reject);
        });
    }

    _buildDataRequest(type: string, method: string, data: any, id: string): Promise<any> {
        var urls = ['data', type];
        if (id) {
            urls.push(id);
        }

        return this._buildRequest(urls, method, data, {})
            .then((res) => {
                return res.data;
            });
    }

    get(type: string, id: string): Promise<any> {
        return this._buildDataRequest(type, 'GET', null, id);
    }

    create(type: string, obj: any): Promise<any> {
        return this._buildDataRequest(type, 'POST', obj, null)
            .then((res: any) => {
                return res._id;
            })
    }

    login(email: string, password: string): Promise<any> {
        return this._buildRequest(['login'], 'POST', {
            email: email,
            password: password
        });
    }

    register(email: string, password: string): Promise<any> {
        return this._buildRequest(['register'], 'POST', {
            email: email,
            password: password
        });
    }
}