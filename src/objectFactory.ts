import {HttpClient} from "./httpClient";
import {App} from './neutrino'
import {NeutrinoObject, ObjectOptions} from './object'
import {AjaxObject} from './ajaxObject'
import {RealtimeObject} from "./realtimeObject";

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

    private _getRealtimeObject(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new RealtimeObject(this.app, id, dataType, opts).get();
    }

    get(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        if (opts.realtime) {
            return this._getRealtimeObject(id, dataType, opts);
        }

        return this._getAjaxObject(id, dataType, opts)
    }

    create(param: any, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            this._httpClient.create(dataType, param)
                .then((id: string) => {
                    if (opts.realtime) {
                        return resolve(new RealtimeObject(this.app, id, dataType, opts));
                    }

                    return resolve(new AjaxObject(this.app, id, dataType, opts));
                })
                .catch(reject);
        });
    }
}