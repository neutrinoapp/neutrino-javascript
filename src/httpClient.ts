'use strict';

const Client = require('axios');
import {App} from './app'

interface HttpHeaders {
    Authorization?: string;
    NeutrinoOptions?: string;
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

        // headers.NeutrinoOptions = JSON.stringify({
        //     clientId: this.app._uniqueId
        // });

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
                .catch((err) => {
                    console.log(err);
                    return reject(err);
                });
        });
    }

    _buildDataRequest(type: string, method: string, data: any, id?: string): Promise<any> {
        var urls = ['data', type];
        if (id) {
            urls.push(id);
        }

        return this._buildRequest(urls, method, data, {})
            .then((res) => {
                return res.data;
            });
    }

    get(type: string, id?: string, opts?: any): Promise<any> {
        return this._buildDataRequest(type, 'GET', null, id);
    }

    create(type: string, obj: any): Promise<string> {
        return this._buildDataRequest(type, 'POST', obj, null)
            .then((res: any) => {
                return res.id;
            })
    }

    update(type: string, id: string, obj: any): Promise<any> {
        return this._buildDataRequest(type, 'PUT', obj, id);
    }

    delete(type: string, id: string): Promise<any> {
        return this._buildDataRequest(type, 'DELETE', null, id);
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