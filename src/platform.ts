declare var Platform: {
    performMicrotaskCheckpoint: any
};

export class NeutrinoPlatform {
    static performMicrotask() {
        Platform.performMicrotaskCheckpoint();
    }
}

if (!Object['observe']) {
    //observe.js does not work automatically if we do not have Object.observe
    setInterval(() => {
        NeutrinoPlatform.performMicrotask();
    }, 100);
}