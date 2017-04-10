var mongoose = require('mongoose');
var db = require('../config.js');

let eventsSchema = mongoose.Schema({
	name: String,
	start: Date,
	created: Date,
	updated: Date,
	artists: [{ type: Schema.Types.ObjectId, ref: 'Artists' }],
	score: Number,
	venue: { type: Schema.Types.ObjectId, ref: 'Venues' },
  location: Object
})

var Events = mongoose.model('Events', eventsSchema);
