export interface Message {
    app: string;
    op: string;
    options: any;
    origin: string;
    pld: any;
    token: string;
    type: string;
    raw: any;
    topic: string;
    timestamp: string;
}