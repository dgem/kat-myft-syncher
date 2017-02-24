'use strict';

const expect = require('chai').expect;
const logHelper = require('../lib/logHelper');

describe('logHelper stringify', function(){

	let insensitiveObject = {
		uuid:'123-123-123-123',
		something: { more: 'complex', but: 'without', anything:{ that: 'is', sensitive:true} }
	};

	function sensitiveData(level) {
		return {
			'x-api-key': `level${level}XAPIKey`,
			email:`level${level}@fqdn.com`,
			firstName:`firstLevel${level}`,
			lastName: `lastLevel${level}`,
			apikey: `level${level}NotXAPIKey`,
			homeAddress: {
				line1: `addressLine1Level${level}`,
				line2:`addressLine2Level${level}`, postcode:`addressLinePostCodeLevel${level}`
			}
		};
	}

	let level1 = sensitiveData(1);

	let sensitive = [
		level1,
		{ insensitiveObject, level1 },
		{ insensitiveObject, level1, nested: sensitiveData(2)},
		{ insensitiveObject, level1, nested: {insensitiveObject, deeply:sensitiveData(3)}},
		{ level1, nested: {insensitiveObject, very:{insensitiveObject, deeply:sensitiveData(4)}}}
	];

	it('shouldn\'t change anything that isn\'t sensitive', function(){
		let original = JSON.stringify(insensitiveObject);
		let stringified= logHelper.stringify(insensitiveObject);
		expect(stringified).to.equal(original);
	});

	describe('Sensitive data tests', function(){
		sensitive.forEach(function(data, index){
			it(`should hide all occurances of x-api-key at index ${index}`, function(){
					// let filtered = JSON.stringify(data);
					let filtered=logHelper.stringify(data);
					expect(filtered.match('XAPIKey')).to.be.null;
			});
			it(`should hide all occurances of apikey at index ${index}`, function(){
					let filtered=logHelper.stringify(data);
					expect(filtered.match('NotXAPIKey')).to.be.null;
			});
			it(`should hide all occurances of email at index ${index}`, function(){
					let filtered=logHelper.stringify(data);
					expect(filtered.match('@fqdn.com')).to.be.null;
			});
			it(`should hide all occurances of firstName at index ${index}`, function(){
					let filtered=logHelper.stringify(data);
					expect(filtered.match('firstLevel')).to.be.null;
			});
			it(`should hide all occurances of lastName at index ${index}`, function(){
					let filtered=logHelper.stringify(data);
					expect(filtered.match('firstLevel')).to.be.null;
			});
			it(`should hide all occurances of homeAddress at index ${index}`, function(){
					let filtered=logHelper.stringify(data);
					expect(filtered.match('addressLine')).to.be.null;
			});
		});
	});

});
