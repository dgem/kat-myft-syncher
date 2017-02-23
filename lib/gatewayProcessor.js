'use strict';

const log = require('@financial-times/n-lambda').logger;
const errors = require('./errors');
const myFT = require('./myFTOperative');

function process(event) {
	if (event.body && event.body.length > 0) {
		let body = JSON.parse(event.body);
		if (body.messages && body.messages instanceof Array) {
			results = body.messages.map((message)=>{
				return messageProcessor(message);
			});
		} else {
			let msg = 'Unhandled API Gateway request, body.messages was empty or not an array!';
			log.error({operation: 'processAPIGWProxy', event:eventEssentials(event), messages: body.messages, status: msg});
			throw new errors.Warning(msg);
		}
	}
	if (event.resource === '/gtg' || event.resource === '/__gtg') {
		return processPing(event);
	// TODO
	// } else if (event.resource === '/health' || event.resource === '/__health') {
	//
	// 	return healthCheck(event);
	}	else {
		let msg = 'Unhandled API Gateway request';
		log.error({operation: 'processAPIGWProxy', event:eventEssentials(event) , status: msg});
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
			case 'LicenseSeatAllocated':
				return licenseSeatAllocated(message);
				break;
			case 'LicenseSeatDeallocated':
				return licenseSeatDeallocated(message);
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
	let body = JSON.parse(message.body);
	let uuid = body.user?body.user.id:undefined;
	log.debug({operation:'userCreated', uuid });
	myFT.synchroniseUser(uuid, body);
}

function licenseSeatAllocated(message) {

}

function licenseSeatDeallocated(message) {

}

module.exports = process;
