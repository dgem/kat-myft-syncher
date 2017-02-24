'use strict';

const expect = require('chai').expect;
const errors = require('../lib/errors');
const gatewayMsg = require('./fixtures/apiGatewayMessage');

describe('Basic apiGatewayMessage tests', function () {

	it('Should create a default structure', function () {
		let msg = gatewayMsg();
		expect(msg).to.not.be.null;
		expect(msg.resource).to.equal('/membership');
		expect(msg.path).to.equal('/membership');
		expect(msg.httpMethod).to.equal('POST');
		expect(msg.body).to.not.be.null;
		expect(msg.resourcePath).to.equal('/membership');
	});

});
