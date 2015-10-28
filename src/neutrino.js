var NeutrinoData = require('./neutrinoData');

export class Neutrino {
    appId: string;

    constructor(appId: string) {
        this.appId = appId;
    }

    use(type: string): NeutrinoData {
         return new NeutrinoData(type);
    }
}