'use strict';

import {Authentication} from './auth'
import {AjaxData} from './ajaxData'
import {RealtimeData} from './realtimeData'

interface AppOptions {
    host?: string
}

interface AppCache {
    [index: string]: any;
}

export class App {
    host: string;
    appHost: string;
    token: string = '';
    auth: Authentication;

    private _realtimeDataCache: AppCache = {};
    private _simpleDataCache: AppCache = {};

    constructor(
        public appId: string,
        private opts?: AppOptions
    ) {
        opts = opts || {};
        this.host = opts.host || 'http://localhost:5000/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';

        this.auth = new Authentication(this);
    }

    use(type): any {
        if (!this._realtimeDataCache[type]) {
            this._realtimeDataCache[type] = new RealtimeData(this, type);
        }

        return this._realtimeDataCache[type];
    }

    useSimple(type): any {
        if (!this._simpleDataCache[type]) {
            this._simpleDataCache[type] = new AjaxData(this, type);
        }

        return this._simpleDataCache[type];
    }

    static app(appId): App {
        return new App(appId);
    }
}