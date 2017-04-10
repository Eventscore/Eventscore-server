var mongoose = require('mongoose');
var db = require('../config.js');

var eventsrawSchema = mongoose.Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Events' },
  data: Object,
});

var EventsRaw = mongoose.model('EventsRaw', eventsrawSchema);
