var mongoose = require('mongoose');
var db = require('../config.js');

var venuesSchema = mongoose.Schema({
  location: String,
  address: String,
  displayName: String,
  geolocation: Number,
  capacity: Number
});

var Venues = mongoose.model('Venues', venuesSchema);