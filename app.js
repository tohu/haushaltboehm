'use strict;';

var express = require('express');
var https = require('https');
var http = require('http');

var app = express();
app.use(express.static(__dirname + '/public'));

app.get('*', function(req,res) {
  console.warn('unknown path: ' + req.url);
  res.sendStatus(404);
});

http.createServer(app).listen(3000);

