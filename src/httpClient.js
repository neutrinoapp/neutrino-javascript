'use strict';

import Client from 'axios';

export default class HttpClient {
    constructor(client) {
        this.client = client;
    }

    _buildRequest(urls, method, data, optionalHeaders) {
        let path = urls.join('/');
        let headers = {};
        Object.assign(headers, optionalHeaders);

        if (this.client.token) {
            headers.Authorization = 'Bearer ' + this.client.token;
        }

        let requestOptions = {
            method: method,
            url: this.client.appHost + path,
            headers: headers
        };

        if (data) {
            requestOptions.data = data;
        }

        return Client(requestOptions);
    }

    login(email, password) {
        return this._buildRequest(['login'], 'POST', {
            email: email,
            password: password
        }).then((body) => {
            this.token = body.token;
        });
    }

    register(email, password) {
        return this._buildRequest(['register'], 'POST', {
            email: email,
            password: password
        });
    }
}