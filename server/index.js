#!/usr/bin/env node
/*
The MIT License (MIT)

Copyright (c) 2013-2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var five = require('johnny-five');
var raspi = require('raspi-io');

// Create the Johnny-Five (J5) instance, specifying that we want to control
// the Raspberry Pi and not something connected via USB
var board = new five.Board({
  io: new raspi()
});

// Wait for the board to be ready
board.on('ready', function() {

  var currentLight = config.defaultLight;

  // Create all of the J5 LED instances and store them for easy access later
  var instances = {};
  config.lights.forEach(function(light) {
    instances[light.id] = new five.Led(light.port);
  });

  // Turn on the default light, as specified in the config file
  instances[currentLight].on();

  // Create an initialize express to serve static files from the client dir,
  // and to use body-parser to parse the content from POST messages
  var app = express();
  app.use(express.static(path.join(__dirname, '..', 'client')));
  app.use(bodyParser.urlencoded({extended: false}));

  // API endpoint for requesting the lighting information
  app.get('/api/lights', function (req, res) {
    res.send(JSON.stringify(config));
  });

  // API endpoint setting which light is on
  app.post('/api/lights', function (req, res) {

    // Get the ID of the light to turn on
    var id = req.body.id;

    // Turn off the previous light
    instances[currentLight].off();

    // Turn on the new light
    currentLight = id;
    instances[currentLight].on();

    // Tell the client we did it. The content of the response doesn't really
    // matter, so we just return "ok" for posterity's sake.
    res.send('ok');
  });

  // Start the server
  var server = app.listen(8000, function () {

    // Print a pretty message saying we are running
    console.log('Lighting control listening at http://%s:%s',
      server.address().address, server.address().port);
  });
});
