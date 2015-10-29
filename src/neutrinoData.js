/* @flow */
'use strict';

import type * as HttpClient from './httpClient';
import type * as WebsocketClient from './websocketClient';

type NeutrinoOptions = {
    once: boolean
}

class NeutrinoData {
    dataType: string;
    options: NeutrinoOptions;
    httpClient: HttpClient;
    websocketClient: WebsocketClient;
    client: Neutrino;

    constructor(client: Neutrino, dataType: string) {
        this.client = client;
        this.dataType = dataType;
        this.options = {};
        this.httpClient = new HttpClient(this.client);
        this.websocketClient = new WebsocketClient(this.client);
    }

    once(): NeutrinoData {
        this.options.once = true;
        return this;
    }

    _getClient(): any {
        if (this.options.once) {
            return this.httpClient;
        }

        return this.websocketClient;
    }

    login(email: string, password: string): Promise {
        return this.httpClient.login(email, password);
    }

    register(email: string, password: string): Promise {
        return this.httpClient.register(email, password);
    }

    set(id: string): Promise {
        return new Promise();
    }

    update(id: string): Promise {
        return new Promise();
    }

    get(id?: string): Promise {
        return new Promise();
    }

    remove(id?: string): Promise {
        return new Promise();
    }
}

module.exports = NeutrinoData;