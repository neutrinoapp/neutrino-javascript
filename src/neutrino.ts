import {ObjectEvents} from './object'
import {ArrayEvents} from './realtimeArray'
import {App, AppOptions} from './app';

let exported = {
    app: (appId: string, opts: AppOptions): App => {
        return new App(appId, opts);
    },
    
    ObjectEvents: ObjectEvents,
    ArrayEvents: ArrayEvents
};

export default exported
