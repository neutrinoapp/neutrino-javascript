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
    private _webSocketClient: WebSocketClient;

    constructor(
        public app: App
    ) {
        this._httpClient = new HttpClient(this.app);
        this._webSocketClient = new WebSocketClient(this.app);
    }

    private _getAjaxObject(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new AjaxObject(this.app, id, dataType, opts).get();
    }

    private _getRealtimeObject(id: string, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new RealtimeObject(this.app, id, dataType, opts).get();
    }

    getMany(dataType: string, opts: any): Promise<NeutrinoObject[]> {
        return new Promise<NeutrinoObject[]>((resolve, reject) => {
            let promise;
            if (opts.realtime) {
                promise = this._webSocketClient.callRead({}, dataType, opts);
            } else {
                promise = this._httpClient.get(dataType, null, opts);
            }

            promise
                .then((objects: any[]) => {
                    if (opts.realtime) {
                        let realtimeArray = RealtimeArray.make(this.app, dataType, objects, opts);
                        return resolve(realtimeArray);
                    }

                    let ajaxObjects = objects.map((o: any) => {
                        return new AjaxObject(this.app, o.id, dataType, null, o);
                    });

                    ajaxObjects['_opts'] = opts;

                    return resolve(ajaxObjects);
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

    create(initialObject: any, dataType: string, opts: ObjectOptions): Promise<NeutrinoObject> {
        return new Promise<NeutrinoObject>((resolve, reject) => {
            let promise;

            if (opts.realtime) {
                promise = this._webSocketClient.callCreate(initialObject, dataType);
            } else {
                promise = this._httpClient.create(dataType, initialObject)
            }

            promise
                .then((id: string) => {
                    let object;

                    if (opts.realtime) {
                        object = new RealtimeObject(this.app, id, dataType, opts, initialObject);

                    } else {
                        object = new AjaxObject(this.app, id, dataType, opts, initialObject)
                    }

                    object._setProp('opts', opts);

                    //TODO: find a way to remove this (problem with the suspended state).
                    setTimeout(() => resolve(object));
                })
                .catch(reject);
        });
    }
}