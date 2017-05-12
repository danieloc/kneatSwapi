/**
 * Created by Daniel on 12/05/2017.
 */
var sinon = require('sinon');
var assert = require('assert');

var chai = require('chai');
var expect = chai.expect;

describe('Check console application', function () {
    it('Check to see that the user is asked for the distance they want to travel', function () {
        // "spy" on `console.log()`
        var spy = sinon.spy(console, 'log');

        // call the function that needs to be tested

        // assert that it was called with the correct value
        assert(spy.calledWith("How many MegaLights do you need to travel?(No Decimal Points)"));

        // restore the original function
        spy.restore();
    });
});