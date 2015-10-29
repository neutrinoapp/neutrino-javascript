'use strict';

let HttpClient = require('./httpClient');

type NeutrinoOptions = {
    once: boolean
}

class NeutrinoData {
    dataType: string;
    options: NeutrinoOptions;
    httpClient: HttpClient;
    client: Neutrino;

    constructor(client: Neutrino, dataType: string) {
        this.client = client;
        this.dataType = dataType;
        this.options = {};
        this.httpClient = new HttpClient(this.client);
    }

    once(): NeutrinoData {
        this.options.once = true;

        return this;
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