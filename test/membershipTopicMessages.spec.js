'use strict';

const expect = require('chai').expect;
const config = require('../lib/config');
const errors = require('../lib/errors');
const processor = require('../lib/eventProcessor');
const apiGatewayMessage = require('./fixtures/apiGatewayMessage');
const uuid = require('uuid');

// const expectOwnProperties = require('./expectExtensions').expectOwnProperties;

describe('Memerbship Topic Messages', function () {

	// const mockAPI = env.USE_MOCK_API;
	//
	// before(function() {
	// 	if (mockAPI) {
	// 		mocks.registerMyFT();
	// 	}
  // });
	// this.timeout('3s');
	//
	// after(function() {
	// 	if (mockAPI) {
	// 		require('fetch-mock').restore();
	// 	}
  // });

	describe('User Created', function () {
		it ('should handle a default UserCreated message', function(done){
			let event = apiGatewayMessage({body:{messages:[{messageType:'UserCreated'}]}});
			processor(event)
			.then(result => {
				// console.log(JSON.stringify(result));
				expect(result).to.not.be.undefined;
				expect(result).to.not.be.null;
				expect(result.statusCode).to.equal(200);
				expect(result.body.user).to.not.be.undefined;
				done();
			})
			.catch(error=>{
				done(error);
			});
		});
		it ('should handle multiple default UserCreated message', function(done){
			let messages = [{messageType:'UserCreated'}, {messageType:'UserCreated'}, {messageType:'UserCreated'}];
			let event = apiGatewayMessage({body:{messages}});
			processor(event)
			.then(result => {
				// console.log(JSON.stringify(result));
				expect(result).to.not.be.undefined;
				expect(result).to.not.be.null;
				expect(result.statusCode).to.equal(200);
				expect(result.body).to.be.an('array');
				expect(result.body).to.have.lengthOf(messages.length);
				result.body.forEach(subResult=>{
					expect(subResult.statusCode).to.equal(200);
					expect(subResult.body).to.have.ownProperty('user');
				});
				done();
			})
			.catch(error=>{
				done(error);
			});
		});
	});

	describe('licenceSeatAllocated', function () {
		it ('should handle a default licenseSeatAllocated message, saying it was not synchronised', function(done){
			let event = apiGatewayMessage({body:{messages:[{messageType:'LicenceSeatAllocated'}]}});
			processor(event)
			.then(result => {
				console.log(JSON.stringify(result));
				expect(result).to.not.be.undefined;
				expect(result).to.not.be.null;
				expect(result.statusCode).to.equal(200);
				expect(result.body.user.uuid).to.be.a('string');
				expect(result.body.user.status).to.not.equal('synchronised');
				done();
			})
			.catch(error=>{
				done(error);
			});
		});
	});
});
