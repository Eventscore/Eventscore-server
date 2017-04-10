require('dotenv').config();

var express = require('express');

var app = express();

// events related endpoint
app.route('/api/events')
  .get(function(req, res) {
    res.statusCode(200).send('Get all events');
  })
  .put(function(req, res) {
    res.send('Update an event');
  })
  .post(function(req, res) {
    res.statusCode(201).send('Add an event');
  });

var port = process.env.PORT || 1337;

app.listen(port);
