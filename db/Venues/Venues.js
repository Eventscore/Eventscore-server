const mongoose = require('mongoose');
const db = require('../config.js');

let venuesSchema = mongoose.Schema({
  location: String,
  address: String,
  name: String,
  geolocation: Number,
  capacity: Number
});

let Venues = mongoose.model('Venues', venuesSchema);