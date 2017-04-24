'user strict';

require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var cron = require('node-cron');
var app = express();
var Users = require('./RequestHandlers/Users.js');
var Events = require('./RequestHandlers/Events.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser('We3Zer$coR3'));
app.use(session({
  secret: 'We3Zer$coR3',
  resave: false,
  saveUninitialized: true
}));


app.get('/api/events/longitude/:lon/latitude/:lat', Events.getNearbyEvents);

//THIS AN EMPTY FUNCTION
app.route('/api/events')
  .put(Events.updateEvent);

//THIS AN EMPTY FUNCTION
app.route('/api/users')
  .get(Users.getAllUsers)
  .post(Users.addUser);

//THIS AN EMPTY FUNCTION
app.route('/api/users/:userid')
  .get(Users.getUser)
  .put(Users.updateUser);

app.post('/auth/users/login', Users.userLogin);
app.post('/auth/users/signup', Users.userSignUp);  

// app.get('/api/keywords', Events.getKeywords);

/* Uncomment section below to enable Cron job - assign sequence accordingly */
cron.schedule('30 * * * *', function(){
  var keywords = Events.getKeywords();
});

var port = process.env.PORT || 1337;
app.listen(port);
console.log('Listening on port', port);
