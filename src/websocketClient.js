/* @flow */
'use strict';

import type * as Neutrino from './neutrino';

class WebsocketClient {
    client: Neutrino;

    constructor(client: Neutrino) {
        this.client = client;
    }
}

module.exports = WebsocketClient;