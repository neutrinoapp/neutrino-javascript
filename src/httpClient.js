/* @flow */
'use strict';

import * as request from '../node_modules/request/request';
import * as _ from '../node_modules/lodash/index'

class HttpClient {
    client: Neutrino;

    constructor(client: Neutrino) {
        this.client = client;
    }

    _buildRequest(urls: Array<string>, method: string, body?: any, optionalHeaders?: any): Promise {
        let url = this.client.appHost + urls.join('/');
        let headers = {};
        _.assign(headers, optionalHeaders);

        if (this.client.token) {
            headers.Authorization = 'Bearer ' + this.client.token;
        }

        return new Promise((resolve, reject) => {
            let requestOptions = {
                method: method,
                url: url,
                headers: headers,
                json: true
            };

            if (body) {
                requestOptions.body = body;
            }

            request(requestOptions, function (err, resp, body) {
                if (err) {
                    return reject(err);
                }

                return resolve(body);
            })
        });
    }

    login(email: string, password: string): Promise {
        return this._buildRequest(['login'], 'POST', {
            email: email,
            password: password
        }).then((body) => {
            this.token = body.token;
        });
    }

    register(email: string, password: string): Promise {
        return this._buildRequest(['register'], 'POST', {
            email: email,
            password: password
        });
    }
}

module.exports = HttpClient;