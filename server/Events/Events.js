var fetch = require('node-fetch');

fetch.Promise = require('bluebird'); 

var Artists = require('../../db/Artists/Artists.js');

var Events = require('../../db/Events/Events.js');


//fetch nearby events from db first
//if events < 10, fetch from api as well
//sort results by distance
exports.getNearbyEvents = function(req, res) {
  console.log('REQ PARAMS', req.params);
  var latitude = req.params.lat;
  var longitude = req.params.lon;
  fetch('https://api.seatgeek.com/2/events?lat=' + latitude + '&lon=' + longitude + '&range=5mi&client_id=' + process.env.SEATGEEK_CLIENTID)
  .then(function(response) {
        return response.json();
    })
  .then(function(json) {
        console.log(json);
        res.send(json);
    });
};

exports.updateEvent = function(req, res) {

};