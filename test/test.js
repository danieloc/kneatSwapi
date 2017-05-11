/**
 * Created by Daniel on 11/05/2017.
 */
var request = require('supertest');
var assert = require('assert');
var swapiLib = require('../swapiLib');

//Check to see that the Database is functioning
describe('GET DEATH STAR INFO', function() {
    var deathStar;
    it('Get Response from API', function(done) {
        request('http://swapi.co/api/')
            .get('starships/9/')
            .end(function (err, response) {
                deathStar = response.body;
                return done();
            });
    });

    it('Check that Death Star was returned', function (done) {
        assert.equal("Death Star", deathStar.name);
        done();
    })
});
describe('CHECK CALCULATIONS', function () {
    it('Check - \'getNumberOfStops\' Function', function (done) {
        //Function should return '2' as 24 goes into 49 twice.
        var numberOfStops = swapiLib.getNumberOfStops(49, '1 day', '1');
        assert.equal(2, numberOfStops);
        return done();
    });
    it('Check - \'getAmountOfHoursBeforeResupplies\' Function - \'2 weeks\'', function (done) {
        //Function should return '2' as 24 goes into 49 twice.
        var numberOfStops = swapiLib.getAmountOfHoursBeforeResupplies('2 weeks');
        assert.equal(2*7*24, numberOfStops);
        return done();
    });
    it('Check - \'getAmountOfHoursBeforeResupplies\' Function - \'1 year\'', function (done) {
        var numberOfStops = swapiLib.getAmountOfHoursBeforeResupplies('1 year');
        assert.equal(Math.round(24*365.2422), numberOfStops);
        return done();
    });
    /*it('Check - \'makeStarshipRequests\' Function - [1,2,3]', function (done) {
        //Checking
        swapiLib.makeStarshipRequests([1,2,3]).then(function (starshipList) {
                assert.equal(30, starshipList.length);
                return done();
        });
    });
    it('Check - \'makeStarshipRequests\' Function - [2,3]', function (done) {
        //Checking
        swapiLib.makeStarshipRequests([2,3]).then(function (starshipList) {
            assert.equal(30, starshipList.length);
            return done();
        });
    });*/
});

