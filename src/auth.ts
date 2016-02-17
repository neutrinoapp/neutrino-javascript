'use strict';

import {HttpClient} from './httpClient';
import {App} from './neutrino'

export class Authentication {
    httpClient: HttpClient;

    constructor(
        private app: App
    ) {
        this.httpClient = new HttpClient(app);
    }

    login(email: string, password: string): Promise<any> {
        return this.httpClient.login(email, password)
            .then((res) => {
                this.app.token = res.data.token;
                return res;
            });
    }

    register(email: string, password: string): Promise<any> {
        return this.httpClient.register(email, password);
    }
}