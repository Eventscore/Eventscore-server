require('dotenv').config();

const express = require('express');

const app = express();

// events related endpoint
app.route('/api/events')
  .get((req, res) => {
    res.send('Get all events');
  })
  .put((req, res) => {
    res.send('Update an event');
  })
  .post((req, res) => {
    res.send('Add an event');
  });

const port = process.env.PORT || 1337;

app.listen(port);
