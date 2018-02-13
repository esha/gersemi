var express = require('express');
var logfmt = require('logfmt');
var bodyParser = require('body-parser');
var cors = require('cors');;
var request = require('request');
var app = express();
var api = process.env.GERSEMI_API || 'http://esha-sandbox.westus.cloudapp.azure.com/';
var port = process.env.GERSEMI_PORT || '8008';

if (!api.endsWith('/')) {
    api += '/';
}

function toURL(req) {
    return api + req.originalUrl.replace('/(api/)?',''));
}

function log(req) {
  const url = toURL(req);
  if (req.method === 'OPTIONS') {
      return { method: req.method, url };
  }
  return {
    method: req.method,
    url,
    headers: req.headers,
    body: typeof req.body === "string" ? req.body : JSON.stringify(req.body)
  };
}
function print(log) {
    console.log(log.method, log.url);
    if (log.headers) {
        for (const key in log.headers) {
            if (!log.headerFilter || log.headerFilter.contains(key)) {
                console.log(key, ': ', log.headers[key]);
            }
        }
    }
    if (log.body) {
        console.log(typeof log.body === "string" ? log.body : JSON.stringify(log.body));
    }
    console.log('\n');
}

app.use(cors());
//app.use(bodyParser.text({ type: ['text/*', 'application/soap+xml'] }));
//app.use(bodyParser.json());
//app.use(logfmt.requestLogger({immediate: true}, log));

app.all('/*', function(req, res) {
    const url = toURL(req);
    const method = req.method.toLowerCase();

    print(log(req))
    try {
        req.pipe(request[method](url))
            .pipe(res);
    } catch (e) {
        res.status(500).send(e.toString()).end();
    }
})

app.listen(port, function() {
    console.log('Using API:', api);
});
