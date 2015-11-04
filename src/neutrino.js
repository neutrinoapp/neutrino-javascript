'use strict';

import NeutrinoAuth from './auth'
import SimpleNeutrinoData from './simpleData'
import RealtimeNeutrinoData from './realtimeData'

class NeutrinoApp {
    constructor(appId, opts) {
        this.appId = appId;

        opts = opts || {};
        this.host = opts.host || 'http://localhost:5000/v1/';

        this.appHost = this.host + 'app/' + this.appId + '/';
        this.token = '';
        this.auth = new NeutrinoAuth(this);
        this._realtimeDataCache = {};
        this._simpleDataCache = {};
    }

    use(type) {
        if (!this._realtimeDataCache[type]) {
            this._realtimeDataCache[type] = new RealtimeNeutrinoData(this, type);
        }

        return this._realtimeDataCache[type];
    }

    useSimple(type) {
        if (!this._simpleDataCache[type]) {
            this._simpleDataCache[type] = new SimpleNeutrinoData(this, type);
        }

        return this._simpleDataCache[type];
    }

    static app(appId) {
        return new NeutrinoApp(appId);
    }
}

module.exports = NeutrinoApp;