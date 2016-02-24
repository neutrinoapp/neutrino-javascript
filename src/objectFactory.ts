import {HttpClient} from "./httpClient";
import {App} from './neutrino'
import {NeutrinoObject, ObjectOptions} from './object'
import {AjaxObject} from './ajaxObject'
import {RealtimeObject} from "./realtimeObject";
import * as _ from 'lodash';
import {WebSocketClient, Message, MessageOp} from "./webSocketClient";
import {RealtimeArray} from './realtimeArray'

export class ObjectFactory {
    private _httpClient: HttpClient;
    //private _webSocketClient: WebSocketClient;

    constructor(
        private app: App
    ) {
        this._httpClient = new HttpClient(this.app);
        //this._webSocketClient = new WebSocketClient(this.app);
    }

    private _getAjaxObject(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new AjaxObject(this.app, id, dataType, opts).get();
    }

    private _getRealtimeObject(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new RealtimeObject(this.app, id, dataType, opts).get();
    }

    getMany(dataType: string, opts: any): Promise<NeutrinoObject[]> {
        return new Promise<NeutrinoObject[]>((resolve, reject) => {
            this._httpClient.get(dataType)
                .then((objects) => {
                    if (opts.realtime) {
                        let realtimeArray = RealtimeArray.make(this.app, dataType, objects);
                        return resolve(realtimeArray)
                    }

                    let ajaxOptions = objects.map((o: any) => {
                        return new AjaxObject(this.app, o._id, dataType, null, o);
                    });

                    return resolve(ajaxOptions);
                })
                .catch(reject);
        });
    }

    get(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        if (opts.realtime) {
            return this._getRealtimeObject(id, dataType, opts);
        }

        return this._getAjaxObject(id, dataType, opts)
    }

    create(param: any, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            //if (opts.realtime) {
            //    this._webSocketClient.sendCreate(param, dataType);
            //    return resolve(null);
            //}

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