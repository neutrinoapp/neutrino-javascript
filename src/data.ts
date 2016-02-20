import {App} from './neutrino'
import {NeutrinoObject, ObjectOptions} from './object'
import {ObjectFactory} from './objectFactory'
import {HttpClient} from './httpClient'

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

    object(param?: any, opts?: ObjectOptions): Promise<NeutrinoObject> {
        opts = opts || <ObjectOptions>{};

        if (typeof param === 'string') {
            let id: string = <string>param;
            return this._factory.get(id, this.dataType, opts);
        }

        return this._factory.create(param, this.dataType, opts);
    }

    //TODO: add filters and such
    //TODO: add realtime option
    objects(): Promise<NeutrinoObject[]> {
        return this._factory.getMany(this.dataType);
    }

    remove(id: string): Promise<any> {
        return this._httpClient.delete(this.dataType, id);
    }
}