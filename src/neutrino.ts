'use strict';

import {Authentication} from './auth'
import {Data} from './data'

interface AppOptions {
    host?: string
    realtimeHost?: string
}

interface AppCache {
    [index: string]: Data;
}

export class App {
    host: string;
    appHost: string;
    realtimeHost: string;
    realtimeAppHost: string;
    token: string = '';
    _uniqueId: string = (Date.now() + (Math.round(Math.random() * Date.now()))) + '';
    auth: Authentication;

    private _dataCache: AppCache = {};

    constructor(
        public appId: string,
        private opts?: AppOptions
    ) {
        opts = opts || {};
        this.host = opts.host || 'http://localhost:5000/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';
        this.realtimeHost = opts.realtimeHost || 'ws://localhost:6000/data';
        this.realtimeAppHost = this.realtimeHost + '?app=' + this.appId + '&id=' + this._uniqueId;

        this.auth = new Authentication(this);
    }

    use(type: string): Data {
        if (!this._dataCache[type]) {
            this._dataCache[type] = new Data(this, type);
        }

        return this._dataCache[type];
    }

    static app(appId): App {
        return new App(appId);
    }
}

if (typeof window !== 'undefined') {
    window['Neutrino'] = App;
} else if (typeof module !== 'undefined') {
    module['exports'] = App;
} else {
    this['Neutrino'] = App;
}