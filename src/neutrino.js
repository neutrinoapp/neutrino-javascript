/* @flow */
'use strict';

import type * as NeutrinoData from './neutrinoData';

class Neutrino {
    appId: string;
    host: string;
    appHost: string;
    token: string;

    constructor(appId: string) {
        this.appId = appId;
        this.host = 'http://localhost:5000/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';
    }

    use(type: string): NeutrinoData {
         return new NeutrinoData(this, type);
    }
}

module.exports = Neutrino;