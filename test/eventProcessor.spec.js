'use strict';

const expect = require("chai").expect;
const errors = require('../lib/errors');
const processor = require('../lib/eventProcessor');

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
		let event = {resource: "/membership", path: "/membership", httpMethod: "POST", headers:{}, requestContext:{}};
		event.body = '{"topic":"membership_users_v1","messages":[{"correlationId":null,"messageTimestamp":"2017-02-20T16:55:59.953+0000","originSystemId":"http://cmdb.ft.com/systems/user-api","originHostLocation":"w1a","originHost":"ip-10-170-39-54","contentType":"application/json","messageId":"35e3cf8d-96c6-4ffe-b942-ffa053c5b362","body":"{"user":{"id":"63d99715-4b52-46d6-8091-f136320cefc7","email":"blablabl@bal.com","title":"","firstName":"bla","lastName":"bla","primaryTelephone":"","homeAddress":{"line1":null,"line2":null,"townCity":null,"state":null,"postcode":null,"country":"GBR"},"marketing":{"ftByEmail":false,"ftByPost":false},"demographics":{"industry":null,"position":null,"responsibility":null}}}","customHeaders":{"FT-Transaction-Id":"829b00fa-8c19-4d26-9120-8cb4c26b77ba"},"messageType":"UserCreated"},{"correlationId":null,"messageTimestamp":"2017-02-20T16:56:00.036+0000","originSystemId":"http://cmdb.ft.com/systems/acc-licence-svc","originHostLocation":"ft_site","originHost":"ip-10-170-37-59","contentType":"application/json","messageId":"d6fa179d-a9e2-4db6-9380-09d250f89327","body":"{"licenceSeatAllocated":{"licenceId":"b0f170de-26de-454d-810d-3be7e2b3e380","userId":"63d99715-4b52-46d6-8091-f136320cefc7","joinedDate":"2017-02-20T16:56:00.025Z","seatExpiryDate":null}}","customHeaders":{"FT-Transaction-Id":"351632ff-30b0-45ec-9071-f0b1fb292417","Allocation-Origin":"LicenceDataSvc (accessLicenceClient)"},"messageType":"LicenceSeatAllocated"},{"correlationId":null,"messageTimestamp":"2017-02-20T16:56:00.045+0000","originSystemId":"http://cmdb.ft.com/systems/usr-product-svc","originHostLocation":"w1b","originHost":"ip-10-170-45-25","contentType":"application/json","messageId":"684efb84-6251-490d-a3a8-847735005c1d","body":"{"userProductsChanged":{"user":{"userId":"63d99715-4b52-46d6-8091-f136320cefc7","products":[{"productCode":"Tools"},{"productCode":"P0"},{"productCode":"P2"}]}}}","customHeaders":{},"messageType":"UserProductsChanged"}]}';
		processor(event)
		.then(result => {
			done();
		})
		.catch(error=>{
			done(error);
		});
	});
});
