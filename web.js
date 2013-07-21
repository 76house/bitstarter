#!/usr/bin/env node

var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var text = fs.readFileSync('index.html').toString();

app.get('/', function(request, response) {

  var pathname = url.parse(request.url).pathname;
  console.log("Request for " + pathname + " received.");
  if (pathname == '/') pathname = 'index.html';
  var text = fs.readFileSync(pathname).toString();
  response.send(text);
});

app.configure(function(){
  app.use(express.static(__dirname));
});

var port = process.env.PORT || 8080;

app.listen(port, function(){
  console.log("Listening on " + port);
});

