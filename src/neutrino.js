'use strict';

let NeutrinoData = require('./neutrinoData');

class Neutrino {
    appId: string;

    constructor(appId: string) {
        this.appId = appId;
    }

    use(type: string): NeutrinoData {
         return new NeutrinoData(this, type);
    }
}

module.exports = Neutrino;