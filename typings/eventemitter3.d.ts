interface Emitter {
    new(): Emitter

    listeners(event?: string): Function[];
    listeners(event: string, param: boolean): boolean;
    emit(event: string, ...args: any[]): boolean;
    on(event: string, fn: Function, context?: any): Emitter;
    once(event: string, fn: Function, context?: any): Emitter;
    removeListener(event: string, fn?: Function, context?: any, once?: boolean): Emitter;
    removeAllListeners(event?: string): Emitter;
    off(event: string, fn?: Function, context?: any, once?: boolean): Emitter;
    addListener(event: string, fn: Function, context?: any): Emitter;
    setMaxListeners(): Emitter;
}