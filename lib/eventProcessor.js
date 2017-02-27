'use strict';

const log = require('@financial-times/n-lambda').logger;
const logHelper = require('./logHelper');
const	recordsProcessor = require('./recordsProcessor');
const gatewayProcessor = require('./gatewayProcessor');
const stringify = require('./logHelper').stringify;
const status = require('./statusProcessor');
const errors = require('./errors');
const AWS = require('aws-sdk');
const fs = require('fs');


/**
 * Processes lambda events
 * @param {event} the event to process
 * @return {Promise} result of processing the event
 */
function process(event) {
	return new Promise((resolve, reject) => {
		let result;
		try {
			if (event.Records) {
				log.silly({operation:'processEvent', status:'S3 or Kinesis records detected'});
				result = recordsProcessor(event);
			} else if (event.httpMethod && event.path && event.resource && event.requestContext) {
				log.silly({operation:'processEvent', status:'API Gateway message detected'});
				result = gatewayProcessor(event);
			} else if (event.isPingTest) {
				log.silly({operation:'processEvent', status:'Ping request detected'});
				result = status.ping(event);
			}
			else {
				let msg = 'Unhandled Event';
				log.error({operation:'processEvent', status:msg, event:logHelper.stringify(event)});
				return errors.Warning(msg);
			}
		} catch (error) {
			log.error({operation:'processEvent', error, event:logHelper.stringify(event)});
			return error;
		};
		log.debug({operation:'processEvent', result:result, event:logHelper.stringify(event)});
		resolve(result);
	})
	.then(result=>{
		return formatResult(result);
	});
};

function formatResult(result) {
	log.silly({operation: 'formatResult', result:stringify(result)});
	let statusCode=200;
	if (Array.isArray(result)) {
		result = result.map(res=>{
 			res = formatResult(res);
			if (res.statusCode !== 200){
				statusCode=res.statusCode;
			}
			return res;
		});
		if (result.length===1) {
			result = result[0].body;
		}
		return {statusCode, body:result};
	}
	if (result instanceof(errors.Fatal)){
		return {statusCode: 500, body:`${result.name}: ${result.toString()}`};
	} else if (result instanceof(errors.Warning)){
		return {statusCode: 200, body:`${result.name}: ${result.toString()}`};
	}
	return {statusCode:200, body:result};
}

module.exports = process;
