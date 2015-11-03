import HttpClient from './httpClient';

export default class NeutrinoAuth {
    constructor(client) {
        this.client = client;
        this.httpClient = new HttpClient(client);
    }

    login(email, password) {
        return this.httpClient.login(email, password);
    }

    register(email, password) {
        return this.httpClient.register(email, password);
    }
}