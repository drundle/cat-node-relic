/// <reference path="./typings/node-uuid/node-uuid.d.ts" />
var nr = require('newrelic');

import uuid = require('node-uuid');
import process = require('./Context');


//workaround until we have sorted out a d.ts file

var cat = require('newrelic/lib/util/cat');
var hashes = require('newrelic/lib/util/hashes');


class App {

    private _newRelicId: string;
    private _newRelicIdKey: string = 'newRelicId';

    constructor(newRelicId: string) {
        this._newRelicId = newRelicId
    }


    force(callback: any): void {
        callback();
    }

    //quick, and dirty
    isNullOrEmpty(value: any): boolean {
        return value == null || value == '';
    }


    instrument(ctx:process.Context) {
        var endpoint = 'amqp:/fake.end.point';
        //below represents the code which will start a newRelic transaction once the process.Context has been created,
        //and the end the transaction on context.end (when it emits finish);


        this.force(nr.createBackgroundTransaction(endpoint, () => {
            console.log('NewRelic - start request ' + endpoint);
            var transaction = nr.agent.tracer.getTransaction();
            var headers = ctx.request.headers;
            var correlationId, newRelicId;
            var encKey;

            //map through (cross app trace)
            if (!nr.agent.config.feature_flag.cat) {
                encKey = nr.agent.config.encoding_key; //<--- Here: encoding key is null, how do we set it?
                console.warn('encKey = ' + encKey);

                //get correlation info and reuse it, else we will create it
                correlationId = this.isNullOrEmpty(headers.correlationId)
                    ? hashes.obfuscateNameUsingKey(uuid.v4(), encKey)
                    : headers.correlationId;


                newRelicId = this.isNullOrEmpty(headers[this._newRelicIdKey])
                    ? hashes.obfuscateNameUsingKey(this._newRelicId, encKey)
                    : headers[this._newRelicIdKey];

                console.log('corrlation Id ' + correlationId);
                console.log('new relic Id ' + newRelicId);

                cat.handleCatHeaders(newRelicId, correlationId, encKey, transaction);
            }


            //on the end of the processing
            ctx.on(process.ContextEvents[process.ContextEvents.finish], ()=> {

                nr.endTransaction(); //<-- expected to see something on my dashboard, or an error somewhere.
                console.log('NewRelic - end request ' + endpoint);
            });
        }));
    }
}

export = App;