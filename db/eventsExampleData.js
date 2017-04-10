// for displaying on react native
module.exports = [
{
  _id: 1,
  name: 'Slim Shady Tour',
  start: {"time":"20:00:00", // from songkick
          "date":"2012-04-18",
          "datetime":"2012-04-18T20:00:00-0800"},
  // created: Date, //when it was added to the table
  // updated: Date, //last time it was updated
  artists: [{name: 'Eminem'}, {name: 'Philip Philips'}, {name: 'Louis CK'}],
  score: 100,
  venue: {"id":6239,
          "displayName":"The Fillmore",
          "lng":-122.4332937, "lat":37.7842398,
          "metroArea":{
            "displayName":"SF Bay Area","country":{"displayName":"US"},"id":26330,"state":{"displayName":"CA"}}},
  location: {"city":"San Francisco, CA, US","lng":-122.4332937,"lat":37.7842398},

},
{
  _id: 2,
  name: 'Charlie Work',
  start: {"time":"20:00:00", // from songkick
          "date":"2017-08-18",
          "datetime":"2017-08-18T20:00:00-0800"},
  // created: Date, //when it was added to the table
  // updated: Date, //last time it was updated
  artists: [{name: 'Conor McGregor'}, {name: 'Dwyane Wade'}, {name: 'Kobe Bean Bryant'}],
  score: 101,
  venue: {"id":6239,
          "displayName":"Rum Ham",
          "lng":-122.4332937, "lat":37.7842398,
          "metroArea":{
            "displayName":"SF Bay Area","country":{"displayName":"US"},"id":26330,"state":{"displayName":"CA"}}},
  location: {"city":"Cerritos, CA, US","lng":-122.4332937,"lat":37.7842398},

}
];