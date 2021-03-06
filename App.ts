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

        var endpoint = ctx.request.headers['endpoint'];//'amqp:fake.end.point';
        //below represents the code which will start a newRelic transaction once the process.Context has been created,
        //and the end the transaction on context.end (when it emits finish);


        this.force(nr.createWebTransaction(endpoint, () => {
            console.log('NewRelic - start request ' + endpoint);
            var transaction = nr.agent.tracer.getTransaction();
            var headers = ctx.request.headers;
            var correlationId, newRelicId;
            var pathHash;
            var encKey;
            var isPartOfTransaction = !this.isNullOrEmpty(headers.correlationId) || transaction.tripId != null;

            var hash = (referringPath: any)=> {
                //is this bit correct?
                var pathHash = hashes.calculatePathHash(
                    nr.agent.config.applications()[0],
                    transaction.name || transaction.partialName,
                    referringPath
                );
                return pathHash;
            };




            //map through (cross app trace)
            if (nr.agent.config.feature_flag.cat && nr.agent.config.encoding_key != null) {
                encKey = nr.agent.config.encoding_key;
                console.warn('encKey = ' + encKey);


                //try to get the transaction ID and ensure this is set on the transaction
                correlationId = this.isNullOrEmpty(headers.correlationId)
                    ? transaction.tripId || transaction.id
                    : headers.correlationId;

                transaction.tripId = correlationId;
                headers.correlationId = correlationId;


                pathHash = hash(headers['referringPath']);
                headers['path'] = pathHash;
                transaction.referringPathHash = headers['referringPath'];

                //if(isPartOfTransaction) {

                    newRelicId = this.isNullOrEmpty(headers[this._newRelicIdKey])
                        ? this._newRelicId
                        : headers[this._newRelicIdKey];

                    var txData:any = [
                        transaction.id,
                        false,
                        transaction.tripId || transaction.id,
                        pathHash
                    ];

                    txData = JSON.stringify(txData);
                    console.warn(txData);
                    var txHeader = hashes.obfuscateNameUsingKey(txData, encKey);

                    console.log('corrlation Id ' + correlationId);
                    console.log('new relic Id ' + newRelicId);

                    cat.handleCatHeaders(hashes.obfuscateNameUsingKey(newRelicId, encKey), txHeader, encKey, transaction);
                //}
            }


            //on the end of the processing
            ctx.on(process.ContextEvents[process.ContextEvents.finish], ()=> {

                //the following had an issue with the event loop
                //nr.endTransaction(); //<-- expected to see something on my dashboard, or an error somewhere.

                //used the transaction directly in this closure (included both as I am changing the transaction type, as i test)
                if (transaction.webSegment) {
                    transaction.setName(transaction.url, 0);
                    transaction.webSegment.markAsWeb(transaction.url);
                    transaction.webSegment.end();
                } else if (transaction.bgSegment) {
                    transaction.bgSegment.end();
                }
                transaction.end();



                console.log('NewRelic - end request ' + endpoint);
            });
        }));
    }


}

export = App;