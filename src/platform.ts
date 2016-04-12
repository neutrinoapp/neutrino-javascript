declare var Platform: {
    performMicrotaskCheckpoint: any
};

export class NeutrinoPlatform {
    static performMicrotask() {
        //TODO: fix in observe-js for this to work even when object.observe is available
        Platform.performMicrotaskCheckpoint();
    }
}

if (!Object['observe']) {
    //observe.js does not work automatically if we do not have Object.observe
    //TODO: setImmediate?
    setInterval(() => {
        NeutrinoPlatform.performMicrotask();
    }, 100);
}