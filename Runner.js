var process = require('./Context');
var App = require('./App');
//the app represents middle-ware, in this case it is the NewRelic APM.
//if you can imagine the server.use(app.Instrument); similar to Express's use.
var app = new App('250d3ecbd2fd35f00ddb53d37feade81da4e5bab');
var runTest = function () {
    //example message
    var message = new process.Message().setBody({ greeting: 'hi' });
    //message.headers.correlationId = uuid.v4();
    message.headers['endpoint'] = 'amqp:fake.end.point';
    var ctx = new process.Context(message);
    app.instrument(ctx);
    //try to represent another call which is related to the previous message.
    setTimeout(function () {
        //context 2
        //example message
        var message2 = new process.Message().setBody({ greeting: 'hi back' });
        message2.headers.correlationId = message.headers.correlationId; //correlate requests
        message2.headers['endpoint'] = 'amqp:epic.end.point';
        message2.headers['referringPath'] = message.headers['path']; //set referring path
        var ctx2 = new process.Context(message2);
        app.instrument(ctx2);
        //end process contexts
        setTimeout(function () {
            ctx2.end();
            ctx.end();
        }, 50);
    }, 100);
};
runTest();
setInterval(function () {
    //run the test scenario a number of times.
    runTest();
}, 1500);
//# sourceMappingURL=Runner.js.map