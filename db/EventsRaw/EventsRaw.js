const mongoose = require('mongoose');
const db = require('../config.js');

const eventsrawSchema = mongoose.Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Events' },
  data: Object,
});

let EventsRaw = mongoose.model('EventsRaw', eventsrawSchema);
