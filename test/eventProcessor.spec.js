'use strict';

const expect = require('chai').expect;
const errors = require('../lib/errors');
const processor = require('../lib/eventProcessor');
const apiGatewayMessage = require('./fixtures/apiGatewayMessage');

describe('Basic Ping event processor tests', function () {

	it('Should be sucessful', function (done) {
		let event = {isPingTest:true};
		processor(event)
		.then(result => {
			expect(result).to.not.be.null;
			expect(result.statusCode).to.equal(200);
			expect(result.body).to.not.be.null;
			done();
		})
		.catch(error=>{
			done(error);
		});
	});

	it('Should be able to raise a Warning', function (done) {
		let event = {isPingTest:true, isWarning:true};
		processor(event)
		.then(result =>{
			done(new Error(`Didn't throw an error, got ${JSON.stringify(result)}`));
		})
		.catch(error=>{
			expect(error).to.be.an.instanceof(errors.Warning);
			done();
		});
	});

	it('Should be able to raise a Fatal error', function (done) {
		let event = {isPingTest:true, isFatal:true};
		processor(event)
		.then(result =>{
			done(new Error(`Didn't throw an error, got ${JSON.stringify(result)}`));
		})
		.catch(error=>{
			expect(error).to.be.an.instanceof(errors.Fatal);
			done();
		});
	});
});

describe('Basic handling of events', function (done) {
	it('Should be able to handle a API GW request', function (done) {
		let event = apiGatewayMessage({body:{messages:[{messageType:'UserCreated'}]}});
		processor(event)
		.then(result => {
			done();
		})
		.catch(error=>{
			done(error);
		});
	});
});
