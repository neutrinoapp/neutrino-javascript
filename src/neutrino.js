'use strict';

import NeutrinoData from './data'
import NeutrinoAuth from './auth'

class Neutrino {
    constructor(appId) {
        this.appId = appId;
        this.host = 'http://localhost:5000/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';
        this.token = '';
        this.auth = new NeutrinoAuth(this);
    }

    use(type) {
         return new NeutrinoData(this, type);
    }
}

module.exports = Neutrino;