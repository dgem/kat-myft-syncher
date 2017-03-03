'use strict';

const expect = require('chai').expect;
const config = require('../lib/config');
const errors = require('../lib/errors');
const processor = require('../lib/eventProcessor');
const apiGatewayMessage = require('./fixtures/apiGatewayMessage');
const uuid = require('uuid');
const testData = require('./fixtures/testData');
const myFT = require('kat-client-proxies').myFTClient;

// const expectOwnProperties = require('./expectExtensions').expectOwnProperties;

describe('Memerbship Topic Messages', function () {
	this.timeout(10000);
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
		it ('should not synchronised a default UserCreated message, saying it was not synchronised', function(done){
			let event = apiGatewayMessage({body:{messages:[{messageType:'UserCreated'}]}});
			processor(event)
			.then(result => {
				// console.log(JSON.stringify(result));
				expect(result).to.not.be.undefined;
				expect(result).to.not.be.null;
				expect(result.statusCode).to.equal(200);
				expect(result.body.user).to.not.be.undefined;
				expect(result.body.user.uuid).to.be.a('string');
				expect(result.body.user.status).to.not.equal('synchronised');
				done();
			})
			.catch(error=>{
				done(error);
			});
		});

		it ('should not synchronised a multiple default UserCreated message, saying it was not synchronised', function(done){
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
					expect(subResult.body.user.uuid).to.be.a('string');
					expect(subResult.body.user.status).to.not.equal('synchronised');
				});
				done();
			})
			.catch(error=>{
				done(error);
			});
		});
	});

	describe('licenceSeatAllocated', function () {
		it ('should not synchronised a default licenseSeatAllocated message, saying it was not synchronised', function(done){
			let event = apiGatewayMessage({body:{messages:[{messageType:'LicenceSeatAllocated'}]}});
			processor(event)
			.then(result => {
				// console.log(JSON.stringify(result));
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

		it ('should ignore a licenseSeatAllocated message for a valid user already in sync on a licence', function(done){
			let body= {body:{messages:[{
				messageType:'LicenceSeatAllocated',
				licenceSeatAllocated: {
					licenceId: testData.validLicenceId,
					userId: testData.validUserId
				}
			}]}};
			let event = apiGatewayMessage(body);
			// console.log(JSON.stringify(event));
			processor(event)
			.then(result => {
				console.log(JSON.stringify(result));
				expect(result).to.not.be.undefined;
				expect(result).to.not.be.null;
				expect(result.statusCode).to.equal(200);
				expect(result.body.user.uuid).to.be.a('string');
				expect(result.body.user.uuid).to.be.equal(testData.validUserId);
				expect(result.body.user.status).to.equal('synchronisationIgnored');
				done();
			})
			.catch(error=>{
				done(error);
			});
		});

		it ('should synchonise a licenseSeatAllocated message for a valid user who is out of sync on a licence', function(done){
			// Add a concept to all users group follows on licence (default is Keith Inc)
			myFT.removeConceptsFollowedByUser(testData.validUserId, testData.validConceptId)
			.then(res=>res)
			.catch((err)=>console.log(`ignoring error ${err.toString()}`))
			.then(()=>{
				myFT.addConceptsFollowedByGroup(testData.validLicenceId, testData.validConceptId)
				.then(()=>{
					let body= {body:{messages:[{
						messageType:'LicenceSeatAllocated',
						licenceSeatAllocated: {
							licenceId: testData.validLicenceId,
							userId: testData.validUserId
						}
					}]}};
					let event = apiGatewayMessage(body);
					// console.log(JSON.stringify(event));
					processor(event)
					.then(result => {
						console.log(JSON.stringify(result));
						expect(result).to.not.be.undefined;
						expect(result).to.not.be.null;
						expect(result.statusCode).to.equal(200);
						expect(result.body.user.uuid).to.be.a('string');
						expect(result.body.user.uuid).to.be.equal(testData.validUserId);
						expect(result.body.user.status).to.equal('synchronisationCompleted');
						done();
					});
				})
				.catch(error=>{
					done(error);
				});
			});
		});


	});

});
