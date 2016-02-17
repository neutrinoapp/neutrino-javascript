'use strict';

import {HttpClient} from './httpClient';
import {App} from './neutrino'

export default class NeutrinoAuth {
    constructor(
        private app: App
    ) {
        this.httpClient = new HttpClient(app);
    }

    login(email, password): Promise {
        return this.httpClient.login(email, password)
            .then((res) => {
                this.app.token = res.data.token;
                return res;
            });
    }

    register(email, password): Promise {
        return this.httpClient.register(email, password);
    }
}