require('dotenv').config();
var express = require('express');
var app = express();
var Users = require('./Users/Users.js');
var Events = require('./Events/Events.js');



//http://localhost:1337/api/events/longitude/-122.406417/latitude/37.785834
app.get('/api/events/longitude/:lon/latitude/:lat', Events.getNearbyEvents);

app.route('/api/events')
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
