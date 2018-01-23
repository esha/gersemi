var express = require('express');
var logfmt = require('logfmt');
var cors = require('cors');;
var request = require('request');

var app = express();
var api = process.env.API || 'http://eshademo.cloudapp.net';

app.use(logfmt.requestLogger({immediate: true}));
app.use(cors());

app.all('/*', function(req, res) {
    const url = api + req.originalUrl;
    const method = req.method.toLowerCase();
    console.log('For', req.method, 'transformed', req.originalUrl, 'to', url);

    req.pipe(request[method](url))
       .pipe(res);
})

app.listen(process.env.PORT || 8008, function() {
    console.log('Using API:', api);
});
