import {Authentication} from './auth'
import {Data} from './collection'
import Utils from './utils'
import {EventEmitter2} from 'eventemitter2'

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
        super();

        opts = opts || {};
        this.host = opts.host || 'http://104.155.50.163/v1/';
        this.appHost = this.host + 'app/' + this.appId + '/';
        this.realtimeHost = opts.realtimeHost || 'ws://104.155.40.140/';

        this.auth = new Authentication(this);
    }

    use(type: string): Data {
        if (!this._dataCache[type]) {
            this._dataCache[type] = new Data(this, type);
        }

        return this._dataCache[type];
    }
}
