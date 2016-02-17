'use strict';

import {Data} from './data'
import {App} from './neutrino'
import {WebsocketClient} from './websocketClient'

export class RealtimeData extends Data {
    public websocketClient: WebsocketClient;

    constructor(
        public app: App,
        public dataType: string
    ) {
        super(app, dataType);
        this.websocketClient = new WebsocketClient(this.app);
    }

    object(id: string): Promise<any> {
        return new Promise(() => {
        });
    }
}
