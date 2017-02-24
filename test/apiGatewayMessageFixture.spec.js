'use strict';

const expect = require('chai').expect;
const errors = require('../lib/errors');
const gatewayMsg = require('./fixtures/apiGatewayMessage');
const uuid = require('uuid');

describe('Basic apiGatewayMessage tests', function () {

	it('Should create a default structure', function () {
		let msg = gatewayMsg();
		// console.log(JSON.stringify(msg));
		expect(msg).to.not.be.null;
		expect(msg.resource).to.equal('/membership');
		expect(msg.path).to.equal('/membership');
		expect(msg.httpMethod).to.equal('POST');
		expect(msg.body).to.not.be.null;
		expect(msg.resourcePath).to.equal('/membership');
	});

	it('Should create a default LicenceSeatAllocated message', function () {
		let message = {body:{messages:[{messageType:'LicenceSeatAllocated'}]}};
		let msg = gatewayMsg(message);
		// console.log(JSON.stringify(msg));
		expect(msg).to.not.be.null;
		expect(msg.body).to.not.be.null;
		expect(msg.body.messages).to.have.lengthOf(1);
		expect(msg.body.messages[0].body.licenceSeatAllocated).to.not.be.undefined;
		expect(msg.body.messages[0].body.licenceSeatAllocated.licenceId).to.be.a('string');
		expect(msg.body.messages[0].body.licenceSeatAllocated.userId).to.be.a('string');
		expect(msg.body.messages[0].body.licenceSeatAllocated.joinedDate).to.be.a('string');
	});

	it('Should create a default UserCreated message', function () {
		let message = {body:{messages:[{messageType:'UserCreated'}]}};
		let msg = gatewayMsg(message);
		// console.log(JSON.stringify(msg));
		expect(msg).to.not.be.null;
		expect(msg.body).to.not.be.null;
		expect(msg.body.messages).to.have.lengthOf(1);
		expect(msg.body.messages[0].body.user).to.not.be.undefined;
		expect(msg.body.messages[0].body.user.id).to.be.a('string');
	});

	it('Should create a custom UserCreated message', function () {
		let userId = uuid();
		let firstName= 'T';
		let title='Mr';
		let message = {body:{messages:[{messageType:'UserCreated', body:{user:{id:userId, title, firstName}}}]}};
		let msg = gatewayMsg(message);
		// console.log(JSON.stringify(msg));
		expect(msg).to.not.be.null;
		expect(msg.body).to.not.be.null;
		expect(msg.body.messages).to.have.lengthOf(1);
		expect(msg.body.messages[0].body.user).to.not.be.undefined;
		expect(msg.body.messages[0].body.user.id).to.equal(userId);
		expect(msg.body.messages[0].body.user.firstName).to.equal(firstName);
		expect(msg.body.messages[0].body.user.title).to.equal(title);
	});


});
