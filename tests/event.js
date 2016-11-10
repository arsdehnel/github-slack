var request = require('supertest');
var goodEvent = require('../mocks/good-event.json')
var badEvent = require('../mocks/bad-event.json');

describe('loading express', function () {

    var server;
    beforeEach(function () {
        delete require.cache[require.resolve('../app/server')];
        server = require('../app/server');
    });
    afterEach(function (done) {
        server.close(done);
    });

    it('200 for good event with proper header to POST /event', function testEvent(done) {
        request(server)
            .post('/event')
            .set('X-GitHub-Event', 'push')
            .send(goodEvent)
            .expect(200, done);
    });

    it('400 for good event with missing event type header', function testEvent(done) {
        request(server)
            .post('/event')
            .send(goodEvent)
            .expect(400, done);
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

    it('400 with bad event', function testPath(done) {
        request(server)
            .post('/event')
            .send(badEvent)
            .expect(400, done);
    });

    it('404 everything else', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .expect(404, done);
    });
});