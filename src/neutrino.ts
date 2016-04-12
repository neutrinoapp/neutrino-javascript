'use strict';

import {Authentication} from './auth'
import {Data} from './collection'
import {ObjectEvents} from './object'
import {ArrayEvents} from './realtimeArray'
import Utils from './utils'

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
    token: string = '';
    _uniqueId: string = Utils.random();
    auth: Authentication;

    private _dataCache: AppCache = {};

    constructor(
        public appId: string,
        private opts?: AppOptions
    ) {
        opts = opts || {};
        //http://104.155.50.163/v1/ | http://localhost:5000/v1
        //ws://104.155.40.140/ | ws://localhost:6000/

        this.host = opts.host || 'http://104.155.50.163/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';
        this.realtimeHost = opts.realtimeHost || 'ws://104.155.40.140/';

        this.auth = new Authentication(this);
    }

    collection(type: string): Data {
        if (!this._dataCache[type]) {
            this._dataCache[type] = new Data(this, type);
        }

        return this._dataCache[type];
    }

    static app(appId, opts): App {
        return new App(appId, opts);
    }
}

App['ObjectEvents'] = ObjectEvents;
App['ArrayEvents'] = ArrayEvents;

if (typeof window !== 'undefined') {
    window['Neutrino'] = App;
} else if (typeof module !== 'undefined') {
    module['Neutrino'] = App;
} else {
    this['Neutrino'] = App;
}