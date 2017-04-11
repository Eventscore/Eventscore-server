var Artists = require('../../db/Artists/Artists.js');
var Events = require('../../db/Events/Events.js');
var SeatGeek = require('seatgeek-js');
var seatgeek = new SeatGeek(process.env.SEATGEEK_CLIENTID);

exports.getNearbyEvents = function(req, res) {
  return seatgeek
  .allEvents()
  .get()
  .then(function (res) {
    res.end();
  });
};

exports.updateEvent = function(req, res) {

};