declare var Platform: {
    performMicrotaskCheckpoint: any
};

export class NeutrinoPlatform {
    static performMicrotask() {
        //TODO: fix in observe-js for this to work even when object.observe is available
        Platform.performMicrotaskCheckpoint();
    }
}

setInterval(() => {
    NeutrinoPlatform.performMicrotask();
}, 10);