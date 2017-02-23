'use strict';

const log = require('@financial-times/n-lambda').logger;
const logHelper = require('./logHelper');
const	recordsProcessor = require('./recordsProcessor');
const gatewayProcessor = require('./gatewayProcessor');
const status = require('./statusProcessor');
const errors = require('./errors');
const AWS = require('aws-sdk');
const fs = require('fs');


/**
 * Processes lambda events
 * @param {event} the event to process
 * @return {Promise} result of processing the event
 */
function processEvent(event) {
	return new Promise((resolve, reject) => {
		let result;
		try {
			if (event.Records) {
				log.silly({operation:'processEvent', status:'S3 or Kinesis records detected'});
				result = recordsProcessor(event);
			} else if (event.httpMethod && event.path && event.resource && event.headers && event.requestContext) {
				log.silly({operation:'processEvent', status:'API Gateway message detected'});
				result = gatewayProcess(event);
			} else if (event.isPingTest) {
				log.silly({operation:'processEvent', status:'Ping request detected'});
				result = status.ping(event);
			}
			else {
				let msg = 'Unhandled Event';
				log.error({operation:'processEvent', status:msg, event:logHelper.stringify(event)});
				throw new errors.Warning(msg);
			}
		} catch (error) {
			log.error({operation:'processEvent', error, event:logHelper.stringify(event)});
			reject(error);
		};
		log.debug({operation:'processEvent', result:result, event:logHelper.stringify(event)});
		resolve(result);
	});
};

module.exports = processEvent;
