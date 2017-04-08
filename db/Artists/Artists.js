const mongoose = require('mongoose');
const db = require('../config.js');

let artistsSchema = mongoose.Schema({
  spotify: Object,
  klout: Number,
  genre: String,
  name: String,
  img: String
});

let Artists = mongoose.model('Artists', artistsSchema);