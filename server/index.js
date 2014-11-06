var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var five = require('johnny-five');
var raspi = require('raspi-io');

var board = new five.Board({
  io: new raspi()
});

board.on('ready', function() {

  var instances = {}

  config.lights.forEach(function(light) {
    instances[light.id] = new five.Led(light.port);
  });

  instances[config.defaultLight].on();

  var app = express();

  app.use(express.static(path.join(__dirname, '..', 'client')));
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/lights', function (req, res) {
    res.send(JSON.stringify(config));
  });

  app.post('/api/lights', function (req, res) {
    var id = req.body.id;

    instances[config.defaultLight].off();
    instances[id].on();

    config.defaultLight = id;
    res.send('ok');
  });

  var server = app.listen(8000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Lighting control listening at http://%s:%s', host, port);
  });
});
