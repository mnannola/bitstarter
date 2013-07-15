var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var buf = new Buffer(fs.readFileSync('index.html'));
  var resp = buf.toString();
  response.send(resp);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
