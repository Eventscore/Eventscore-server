require('dotenv').config();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var eventsExampleData = require('../db/eventsExampleData');

var express = require('express');
var app = express();
var Users = require('./Users/Users.js');
var Events = require('./Events/Events.js');

// example data
app.get('/api/events/exampledata', (req, res) => {
  res.send(eventsExampleData);
});

//http://localhost:1337/api/events/longitude/-122.406417/latitude/37.785834
app.get('/api/events/longitude/:lon/latitude/:lat', Events.getNearbyEvents);

// events related endpoint
app.route('/api/events')
  .put(Events.updateEvent)
  .post(jsonParser, function(req, res) {
    console.log('req.body: ', typeof req.body, req.body);
    res.send('Add an event');
  });

app.route('/api/users')
  .get(Users.getAllUsers)
  .post(Users.addUser)

app.route('/api/users/:userid')
  .get(Users.getUser)
  .put(Users.updateUser)

var port = process.env.PORT || 1337;

app.listen(port);

console.log('Listening on port', port);