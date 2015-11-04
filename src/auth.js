'use strict';

import HttpClient from './httpClient';

export default class NeutrinoAuth {
    constructor(app) {
        this.app = app;
        this.httpClient = new HttpClient(app);
    }

    login(email, password) {
        return this.httpClient.login(email, password)
            .then((res) => {
                this.app.token = res.data.token;
                return res;
            });
    }

    register(email, password) {
        return this.httpClient.register(email, password);
    }
}