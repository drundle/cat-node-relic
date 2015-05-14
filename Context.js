/// <reference path="./typings/node/node.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NodeEvents = require('events');
var ContextState;
(function (ContextState) {
    ContextState[ContextState["active"] = 0] = "active";
    ContextState[ContextState["ended"] = 1] = "ended";
})(ContextState || (ContextState = {}));
(function (ContextEvents) {
    ContextEvents[ContextEvents["finish"] = 0] = "finish";
})(exports.ContextEvents || (exports.ContextEvents = {}));
var ContextEvents = exports.ContextEvents;
var Context = (function (_super) {
    __extends(Context, _super);
    function Context(request) {
        _super.call(this);
        this._status = 0 /* active */;
        this._request = request;
    }
    Object.defineProperty(Context.prototype, "request", {
        get: function () {
            return this._request;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * this must be called to signify the end of the processing context
     * note can only be called once
     */
    Context.prototype.end = function () {
        if (this._status === 1 /* ended */) {
            throw 'context has already ended\n' + JSON.stringify(this);
        }
        //this.emit('finish', object);
        this.emit(ContextEvents[0 /* finish */], this);
    };
    return Context;
})(NodeEvents.EventEmitter);
exports.Context = Context;
var ContextWithResponse = (function (_super) {
    __extends(ContextWithResponse, _super);
    function ContextWithResponse() {
        _super.apply(this, arguments);
        this._response = new Message();
    }
    Object.defineProperty(ContextWithResponse.prototype, "response", {
        get: function () {
            return this._response;
        },
        enumerable: true,
        configurable: true
    });
    return ContextWithResponse;
})(Context);
exports.ContextWithResponse = ContextWithResponse;
var Message = (function () {
    function Message() {
        /**
         * message header information
         */
        this.headers = new Headers();
    }
    Message.prototype.setBody = function (body) {
        this.body = body;
        return this;
    };
    return Message;
})();
exports.Message = Message;
var Headers = (function () {
    function Headers() {
        this._container = {};
    }
    Headers.prototype.get = function (key) {
        return this._container[key];
    };
    Headers.prototype.set = function (key, value) {
        this._container[key] = value;
    };
    Headers.prototype.remove = function (key) {
        delete this._container[key];
    };
    Object.defineProperty(Headers.prototype, "values", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Headers.prototype, "correlationId", {
        get: function () {
            return this.get('correlationId');
        },
        set: function (id) {
            this.set('correlationId', id);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Headers.prototype, "topic", {
        get: function () {
            return this.get('topic');
        },
        set: function (topic) {
            this.set('topic', topic);
        },
        enumerable: true,
        configurable: true
    });
    return Headers;
})();
exports.Headers = Headers;
//# sourceMappingURL=Context.js.map