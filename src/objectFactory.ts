import {HttpClient} from "./httpClient";
import {App} from './neutrino'
import {NeutrinoObject, ObjectOptions} from './object'
import {AjaxObject} from './ajaxObject'

export class ObjectFactory {
    private _httpClient: HttpClient;

    constructor(
        private app: App
    ) {
        this._httpClient = new HttpClient(this.app);
    }

    private _getAjaxObject(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new AjaxObject(this.app, id, dataType, opts).get();
    }

    get(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            if (opts.realtime) {

            }

            this._getAjaxObject(id, dataType, opts)
                .then(resolve)
                .catch(reject);
        });
    }

    create(param: any, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            this._httpClient.create(dataType, param)
                .then((id: string) => {
                    if (opts.realtime) {

                    }

                    return resolve(new AjaxObject(this.app, id, dataType, opts));
                })
                .catch(reject);
        });
    }
}