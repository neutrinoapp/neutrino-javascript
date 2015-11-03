'use strict';

import HttpClient from './httpClient';
import WebsocketClient from './websocketClient';

export default class NeutrinoData {
    constructor(client, dataType) {
        this.client = client;
        this.dataType = dataType;
        this.options = {};
        this.httpClient = new HttpClient(this.client);
        this.websocketClient = new WebsocketClient(this.client);
    }

    once() {
        this.options.once = true;
        this.two = false;
        return this;
    }

    _getClient() {
        if (this.options.once) {
            return this.httpClient;
        }

        return this.websocketClient;
    }

    set(id) {
        return new Promise();
    }

    update(id) {
        return new Promise();
    }

    get(id) {
        return new Promise();
    }

    remove(id) {
        return new Promise();
    }
}