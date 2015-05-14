/// <reference path="./typings/node/node.d.ts" />

import NodeEvents = require('events');

enum ContextState {
    active,
    ended
}

export enum ContextEvents {
    finish
}

export class Context extends NodeEvents.EventEmitter{

    private _request: Message;
    private _status : ContextState = ContextState.active;

    constructor(request: Message){
        super();
        this._request = request;
    }

    get request(): Message {
        return this._request;
    }

    /**
     * this must be called to signify the end of the processing context
     * note can only be called once
     */
    end(): void {
        if(this._status === ContextState.ended){
            throw 'context has already ended\n' + JSON.stringify(this);
        }

        //this.emit('finish', object);
        this.emit(ContextEvents[ContextEvents.finish], this);
    }
}

export class ContextWithResponse extends Context {

    private _response: Message = new Message();

    get response(): Message { return this._response; }

}

export class Message {

    /**
     * message header information
     */
    headers : Headers = new Headers();

    /**
     * message content
     */
    body: any;

    setBody(body: any): Message {
        this.body = body;
        return this;
    }

}

export class Headers {

    private _container = {};

    get(key:string): string {
        return <string>this._container[key];
    }

    set(key:string, value:string){
        this._container[key] = value;
    }

    remove(key:string){
        delete this._container[key];
    }

    get values(): any{
        return this._container;
    }

    get correlationId(): string {
        return this.get('correlationId');
    }

    set correlationId(id: string) {
        this.set('correlationId', id);
    }

    get topic(): string {
        return this.get('topic');
    }

    set topic(topic: string) {
        this.set('topic', topic);
    }
}