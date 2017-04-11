var mongoose = require('mongoose');
var db = require('../config.js');

var eventsrawSchema = mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events' },
  data: Object,
});

var EventsRaw = mongoose.model('EventsRaw', eventsrawSchema);
