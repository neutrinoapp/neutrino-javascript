import {App} from './neutrino'
import {NeutrinoObject, ObjectOptions} from './object'
import {ObjectFactory} from './objectFactory'
import {HttpClient} from './httpClient'
import * as _ from 'lodash'

export class Data {
    private _factory: ObjectFactory;
    private _httpClient: HttpClient;

    constructor(
        public app: App,
        public dataType: string
    ) {
        this._factory = new ObjectFactory(this.app);
        this._httpClient = new HttpClient(this.app);
    }

    create(param?: any, opts?: ObjectOptions): Promise<NeutrinoObject> {
        opts = opts || <ObjectOptions>{};
        opts.realtime = true;

        if (_.isString(param)) {
            let id: string = <string>param;
            return this._factory.get(id, this.dataType, opts);
        }

        return this._factory.create(param, this.dataType, opts);
    }
    
    createSimple(param?: any, opts?: ObjectOptions): Promise<NeutrinoObject> {
        opts = opts || <ObjectOptions>{};
        opts.realtime = false;

        if (_.isString(param)) {
            let id: string = <string>param;
            return this._factory.get(id, this.dataType, opts);
        }

        return this._factory.create(param, this.dataType, opts);
    }

    get(param?: any): Promise<NeutrinoObject[]> {
        param = param || {};
        param.realtime = true;
        
        return this._factory.getMany(this.dataType, param);
    }
    
    getSimple(param?: any): Promise<NeutrinoObject[]> {
        param = param || {};
        param.realtime = false;
        
        return this._factory.getMany(this.dataType, param);
    }

    delete(id: string): Promise<any> {
        return this._httpClient.delete(this.dataType, id);
    }
}