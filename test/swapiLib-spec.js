/**
 * Created by Daniel on 11/05/2017.
 */
var request = require('supertest');
var assert = require('assert');
var swapiLib = require('../app/swapiLib');
var chai = require('chai');
var expect = chai.expect;

//Check to see that the API is functioning
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
        assert.equal(2 * 7 * 24, numberOfStops);
        return done();
    });
    it('Check - \'getAmountOfHoursBeforeResupplies\' Function - \'1 year\'', function (done) {
        var numberOfStops = swapiLib.getAmountOfHoursBeforeResupplies('1 year');
        assert.equal(Math.round(24 * 365.2422), numberOfStops);
        return done();
    });
});
describe('MAKE ASYNCHRONOUS STARSHIP REQUESTS', function () {
    it('Check - \'makeStarshipRequests\' Function - [1,2,3]', function () {
        //Request Pages 1,2,3 - 10 Objects each.
        //Pages 4,5 and is then called implicitly in the makeStarshipRequest function
        //Page 4 has 7 objects making a total of 37.
         return swapiLib.makeStarshipRequests([1,2,3]).then(function (starshipList) {
             expect(starshipList.length).to.equal(37);
         });
    });
    it('Check - \'makeStarshipRequests\' Function - [2,3]', function () {
        //Request pages 2 and 3. 10 Objects each.
        //Since neither pages 2 or 3 return a 404 - pages 4 and 5 are called
        //Page 4 returns 7 objects bringing the total to 27 objects.
        swapiLib.makeStarshipRequests([2,3]).then(function (starshipList) {
            expect(starshipList.length).to.equal(27);
        });
    });
});