var request = require('supertest');
var mock = require('../mocks/event.json')

describe('loading express', function () {

    var server;
    beforeEach(function () {
        delete require.cache[require.resolve('../app/server')];
        server = require('../app/server');
    });
    afterEach(function (done) {
        server.close(done);
    });

    it('responds to POST /event', function testEvent(done) {
        request(server)
            .post('/event')
            .send(mock)
            .expect(200, done);
    });

    // it('includes response with required values', function testEventResponse(done) {
    //     request(server)
    //         .post('/event')
    //         .send(mock)
    //         .end(function(err, res) {
    //           if (err) {
    //             throw err;
    //           }
    //         });
    // })

    it('400 everything else', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .expect(400, done);
    });
});