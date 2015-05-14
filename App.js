/// <reference path="./typings/node-uuid/node-uuid.d.ts" />
var nr = require('newrelic');
var uuid = require('node-uuid');
var process = require('./Context');
//workaround until we have sorted out a d.ts file
var cat = require('newrelic/lib/util/cat');
var hashes = require('newrelic/lib/util/hashes');
var App = (function () {
    function App(newRelicId) {
        this._newRelicIdKey = 'newRelicId';
        this._newRelicId = newRelicId;
    }
    App.prototype.force = function (callback) {
        callback();
    };
    //quick, and dirty
    App.prototype.isNullOrEmpty = function (value) {
        return value == null || value == '';
    };
    App.prototype.instrument = function (ctx) {
        var _this = this;
        var endpoint = 'amqp:/fake.end.point';
        //below represents the code which will start a newRelic transaction once the process.Context has been created,
        //and the end the transaction on context.end (when it emits finish);
        this.force(nr.createBackgroundTransaction(endpoint, function () {
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
                correlationId = _this.isNullOrEmpty(headers.correlationId) ? hashes.obfuscateNameUsingKey(uuid.v4(), encKey) : headers.correlationId;
                newRelicId = _this.isNullOrEmpty(headers[_this._newRelicIdKey]) ? hashes.obfuscateNameUsingKey(_this._newRelicId, encKey) : headers[_this._newRelicIdKey];
                console.log('corrlation Id ' + correlationId);
                console.log('new relic Id ' + newRelicId);
                cat.handleCatHeaders(newRelicId, correlationId, encKey, transaction);
            }
            //on the end of the processing
            ctx.on(process.ContextEvents[0 /* finish */], function () {
                nr.endTransaction(); //<-- expected to see something on my dashboard, or an error somewhere.
                console.log('NewRelic - end request ' + endpoint);
            });
        }));
    };
    return App;
})();
module.exports = App;
//# sourceMappingURL=App.js.map