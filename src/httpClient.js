class HttpClient {
    client: Neutrino;

    constructor(client: Neutrino) {
        this.client = client;
    }
}

module.exports = HttpClient;