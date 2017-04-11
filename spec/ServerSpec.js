var request = require('request');
var expect = require('chai').expect;

describe('server', function() {
  it('should respond to GET requests for /api/events with a 200 status code', function(done) {
    request('http://localhost:1337/api/events', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
 });