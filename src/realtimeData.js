'use strict';

import NeutrinoData from './data'
import WebsocketClient from './websocketClient'

export default class RealtimeNeutrinoData extends NeutrinoData {
    constructor(app, dataType) {
        super(app, dataType);
        this.websocketClient = new WebsocketClient(this.app);
    }

    object(id) {
        return new Promise();
    }
}
