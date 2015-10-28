type NeutrinoOptions = {
    once: boolean
}

class NeutrinoData {
    dataType: string;
    options: NeutrinoOptions;

    constructor(dataType: string) {
        this.dataType = dataType;
        this.options = new NeutrinoOptions();
    }

    once(): NeutrinoData {
        this.options.once = true;

        return this;
    }

    set(id: string): Promise {
        return new Promise();
    }

    update(id: string): Promise {
        return new Promise();
    }

    get(id?: string): Promise {
        return new Promise();
    }

    remove(id?: string): Promise {
        return new Promise();
    }
}

module.exports = NeutrinoData;