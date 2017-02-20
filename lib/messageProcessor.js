'use strict';

const log = require('@financial-times/n-lambda').logger;
const errors = require(`./errors`);

/**
 * Processes a report
 * @param {message} the FTMessage to process
 * @param {outputStream} where a report on the processing is written to
 * @return {Promise} result of processing the message
 */
function process(message, outputStream) {
	if (message.body){
		let body= JSON.parse(message.body);
		if (body.messageType) {
			switch (body.messageType) {
				case 'UserCreated':
					return userCreate(body);
					break;
				default:
				let msg = "Unhandled messageType";
				log.error({operation:'messageProcessor', status: msg, messageType:body.messageType});
				throw new errors.Warning(msg);
			}
		} else {
			let msg = "Message not processed, no messageType exists";
			log.error({operation:'messageProcessor', status: msg, body:JSON.stringify(body)});
			throw new errors.Warning(msg);
		}
	}
	else {
		let msg = "Message not processed, no body exists";
		log.error({operation:'messageProcessor', status: msg, body:message.body});
		throw new errors.Warning(msg);
	}
}

function userCreated(payload) {
	log.debug({operation:'userCreated', payload});
}


module.exports = process();
