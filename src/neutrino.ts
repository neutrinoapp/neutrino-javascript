'use strict';

import NeutrinoAuth from './auth'
import SimpleNeutrinoData from './simpleData'
import RealtimeNeutrinoData from './realtimeData'

interface AppOptions {
    host: string
}

interface AppCache {
    [index: string]: any;
}

export class App {
    public host: string;
    public appHost: string;
    public token: string = '';

    private realtimeDataCache: AppCache = {};
    private simpleDataCache: AppCache = {};

    constructor(
        public appId: string,
        private opts?: AppOptions
    ) {
        opts = opts || {};
        this.host = opts.host || 'http://localhost:5000/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';

        this.auth = new NeutrinoAuth(this);
    }

    use(type): any {
        if (!this.realtimeDataCache[type]) {
            this.realtimeDataCache[type] = new RealtimeNeutrinoData(this, type);
        }

        return this.realtimeDataCache[type];
    }

    useSimple(type): any {
        if (!this.simpleDataCache[type]) {
            this.simpleDataCache[type] = new SimpleNeutrinoData(this, type);
        }

        return this.simpleDataCache[type];
    }

    static app(appId) {
        return new App(appId);
    }
}