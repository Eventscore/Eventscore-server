require('dotenv').config();
var express = require('express');
var app = express();
var Users = require('./Users/Users.js');
var Events = require('./Events/Events.js');

// events related endpoint
app.route('/api/events')
  .get(Events.getNearbyEvents)
  .put(Events.updateEvent)

app.route('/api/users')
  .get(Users.getAllUsers)
  .post(Users.addUser)

app.route('/api/users/:userid')
  .get(Users.getUser)
  .put(Users.updateUser)

var port = process.env.PORT || 1337;

app.listen(port);

console.log('Listening on port', port);
