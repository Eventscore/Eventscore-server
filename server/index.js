'use strict';
let dotenv = require('dotenv')
let eventsExampleData = require('../db/eventsExampleData');

dotenv.load();
dotenv.config({path: process.env.PWD + '/config.env'});

let express = require('express');
let app = express();

//events related endpoint
app.route('/api/events')
  .get(function(req, res){
  	res.send(eventsExampleData);
  })
  .put(function(req, res){
    res.send('Update an event');
  })
  .post(function(req, res){
    res.send('Add an event');
  })

let port = process.env.PORT || 1337;

app.listen(port);

console.log('Listening on port ', port);