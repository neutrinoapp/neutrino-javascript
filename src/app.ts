import {Authentication} from './auth'
import {Data} from './data'
import Utils from './utils'

export interface AppOptions {
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
        this.host = opts.host || 'http://104.155.97.49/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';
        this.realtimeHost = opts.realtimeHost || 'ws://23.251.130.65/';

        this.auth = new Authentication(this);
    }

    use(type: string): Data {
        if (!this._dataCache[type]) {
            this._dataCache[type] = new Data(this, type);
        }

        return this._dataCache[type];
    }
}