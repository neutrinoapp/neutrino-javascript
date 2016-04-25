import {Message} from './message';
import * as _ from 'lodash';

export class RealTimeConnection {
    private _sessionListeners = [];

    constructor(
        public connection?: autobahn.Connection,
        public session?: autobahn.Session
    ) {}

    subscribe(topic: string, callback: any, opts: any) {
        if (!this.session) {
            return;
        }

        this.session.subscribe(topic, callback, opts)
            .then(() => console.log('Subscribed to: ' + topic), console.error.bind(console));
    }

    setSession(s: autobahn.Session) {
        this.session = s;
        setTimeout(() => {
            this._sessionListeners.forEach(cb => {
                this.subscribe(cb.topic, cb.callbacksHandler, cb.opts);
            });
        });
    }

    getSession(): Promise<autobahn.Session> {
        return new Promise<autobahn.Session>((resolve) => {
            let interval = setInterval(() => {
                if (this.session) {
                    clearInterval(interval);
                    return resolve(this.session);
                }
            }, 50);
        });
    }

    subscribeToSession(topic: string, cb, opts?: any) {
        opts = opts || {};
        delete opts.realtime; //we do not need this to get to the server anyways
        let subscriptionHash = topic + ' ';
        _.chain(opts).keys().sortBy().each(key => {
            //TODO: handle functions
            subscriptionHash += JSON.stringify({key: opts[key]}) + ' ';
        });

        let callbackWrapped = (e) => {
            if (!e.length) {
                return cb(e);
            }

            let arg = e[0];
            let msg: Message;
            if (_.isString(arg)) {
                msg = JSON.parse(e[0]);
            } else {
                msg = arg;
            }

            return cb(msg);
        };

        let subscriptionEntry = _.find(this._sessionListeners, {hash: subscriptionHash});
        if (!subscriptionEntry) {
            let listener = {
                hash: subscriptionHash,
                topic: topic,
                callbacks: [callbackWrapped],
                callbacksHandler: (e) => {
                    listener.callbacks.forEach(cb => cb(e));
                },
                opts: opts
            };

            this._sessionListeners.push(listener);

            this.subscribe(listener.topic, listener.callbacksHandler, listener.opts);
        } else {
            subscriptionEntry.callbacks.push(callbackWrapped);
        }
    }
}
