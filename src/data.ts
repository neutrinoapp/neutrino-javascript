'use strict';

import {App} from './neutrino'

export class Data {
    options: any = {};

    constructor(
        public app: App,
        public dataType: string
    ) { }
}