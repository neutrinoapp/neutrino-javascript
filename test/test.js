var expect,
    app,
    N;

if (typeof window === 'undefined') {
    chai = require('chai');
    expect = chai.expect;
    N = require('../dist/neutrino.js');
} else {
    expect = chai.expect;
    N = Neutrino;
}

app = N.app('d837242752dd495ebe623b0db6038d14');

describe('Neutrino', function () {
    var accountName = 'testData',
        accountPass = `123456`,
        appName = 'test';

    before(function (done) {
        app.auth
            .register(accountName, accountPass)
            .then(function () {
                return app.auth.login(accountName, accountPass)
            })
            .then(function () {
                done();
            });
    });

    describe('Data', function () {
        var collection = app.use(appName),
            data = 'simple test data';

        it('should return test data', function (done) {
            collection
                .object({ data: data })
                .then(function (item) {
                    expect(item.data).to.equal(data);
                    done();
                });
        });
    });
});