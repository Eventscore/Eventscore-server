require('dotenv').config();
var eventsExampleData = require('../db/eventsExampleData');

var express = require('express');

var app = express();

// events related endpoint
app.route('/api/events')
  .get(function(req, res){
  	res.send(eventsExampleData);
  })
  .put(function(req, res) {
    res.send('Update an event');  
  })
  .post(function(req, res) {
    res.send('Add an event');  
  });

var port = process.env.PORT || 1337;

app.listen(port);

console.log('Listening on port', port);
