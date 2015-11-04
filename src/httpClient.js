'use strict';

import Client from 'axios';

export default class HttpClient {
    constructor(app) {
        this.app = app;
    }

    _buildRequest(urls, method, data, optionalHeaders) {
        let path = urls.join('/');
        let headers = {};
        Object.assign(headers, optionalHeaders);

        if (this.app.token) {
            headers.Authorization = 'Bearer ' + this.app.token;
        }

        let requestOptions = {
            method: method,
            url: this.app.appHost + path,
            headers: headers
        };

        if (data) {
            requestOptions.data = data;
        }

        return new Promise((resolve, reject) => {
            Client(requestOptions)
                .then((res) => {
                    res.data = res.data || {};
                    return resolve(res);
                })
                .catch(reject);
        });
    }

    _buildDataRequest(type, method, data, id) {
        var urls = ['data', type];
        if (id) {
            urls.push(id);
        }

        return this._buildRequest(urls, method, data, {})
            .then((res) => {
                return res.data;
            });
    }

    get(type, id) {
        return this._buildDataRequest(type, 'GET', null, id);
    }

    login(email, password) {
        return this._buildRequest(['login'], 'POST', {
            email: email,
            password: password
        });
    }

    register(email, password) {
        return this._buildRequest(['register'], 'POST', {
            email: email,
            password: password
        });
    }
}