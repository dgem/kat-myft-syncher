'use strict';

const log = require('@financial-times/n-lambda').logger;
const errors = require('./errors');
const status = require('./statusProcessor');
const synch = require('./synchronisation');
const config = require('./config');
const stringify = require('./logHelper').stringify;
const directly = require('directly');


function process(event) {
	if (event.body && event.body !== null) {
		let body = typeof event.body === 'string'?JSON.parse(event.body):event.body;
		log.error({operation: 'processAPIGWProxy', body:stringify(body)});
		if (body.messages && body.messages instanceof Array) {
			let promises = body.messages.map((message)=>{
				return function() {
					return processMessage(message);
				};
			});
			return directly(10,promises);
		} else {
			let msg = 'Unhandled API Gateway request, body.messages was empty or not an array!';
			log.error({operation: 'processAPIGWProxy', event:stringify(event), messages: body.messages, status: msg});
			throw new errors.Warning(msg);
		}
	} else if (event.resourcePath === '/gtg' || event.resourcePath === '/__gtg') {
		return status.gtg(event)
		.then(result=>{
			return result;
		});
	// TODO
	// } else if (event.resource === '/health' || event.resource === '/__health') {
	//
	// 	return healthCheck(event);
	}	else {
		let msg = 'Unhandled API Gateway request';
		log.error({operation: 'processAPIGWProxy', event:stringify(event) , status: msg});
		throw new errors.Warning(msg);
	}
}

/**
 * Processes a message (from membership)
 * @param {message} the FTMessage to process
 * @param {outputStream} where a report on the processing is written to
 * @return {Promise} result of processing the message
 */
function processMessage(message, outputStream) {
	if (message.messageType) {
		switch (message.messageType) {
			case 'UserCreated':
				return userCreated(message);
				break;
			case 'LicenceSeatAllocated':
				return licenceSeatAllocated(message);
				break;
			case 'LicenceSeatDeAllocated':
				return licenceSeatDeallocated(message);
				break;
			default:
				let msg = "Unhandled messageType";
				log.warn({operation:'messageProcessor', status: msg, messageType:message.messageType});
				throw new errors.Warning(`${msg} ${message.messageType}`);
		}
	} else {
		let msg = "Message not processed, no messageType exists";
		log.error({operation:'messageProcessor', status: msg, body:JSON.stringify(message.body?message.body:{})});
		throw new errors.Warning(msg);
	}
}

function userCreated(message) {
	let body = message.body;
	let uuid = body.user?body.user.id:undefined;
	log.debug({operation:'userCreated message', uuid });
	return synch.user(uuid, body);
}

function licenceSeatAllocated(message) {
	let msg = message.body.licenceSeatAllocated;
	let uuid = msg.userId;
	let licenceId = msg.licenceId;
	log.silly({operation:'licenseSeatAllocated message', uuid, licenceId, msg:JSON.stringify(msg) });
	return synch.user(uuid, {licenceId});
}

function licenceSeatDeallocated(message) {

}

module.exports = process;
