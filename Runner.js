var process = require('./Context');
var App = require('./App');
//example message
var ctx = new process.Context(new process.Message().setBody({ greeting: 'hi' }));
//the app represents middle-ware, in this case it is the NewRelic APM.
//if you can imagine the server.use(app.Instrument); similar to Express's use.
var app = new App('250d3ecbd2fd35f00ddb53d37feade81da4e5bab');
app.instrument(ctx);
//used to signify the end of  the process pipeline, which should end the newrelic transaction.
setTimeout(function () {
    //end process context
    ctx.end();
}, 1000);
//# sourceMappingURL=Runner.js.map