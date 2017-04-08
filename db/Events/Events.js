const mongoose = require('mongoose');
const db = require('../config.js');

let eventsSchema = mongoose.Schema({
	name: String,
	start: Date, //may change to something else depending on response data
	created: Date, //when it was added to the table
	updated: Date, //last time it was updated
	artist: [{ type: Schema.Types.ObjectId, ref: 'Artists' }],
	score: Number,
	venue: { type: Schema.Types.ObjectId, ref: 'Venues' }
})

let Events = mongoose.model('Events', eventsSchema);