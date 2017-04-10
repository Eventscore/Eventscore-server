var request = require('request');
var expect = require('chai').expect;

describe('server', function() {
  it('should respond to GET requests for /api/events with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
 });