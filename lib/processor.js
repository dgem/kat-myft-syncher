'use strict';

const log = require('@financial-times/n-lambda').logger;
const errors = require(`./errors`);

function dump(object) {
	log.debug({operation:'objectDump', object:JSON.stringify(object)});
}

function processEvent(event) {
	return new Promise((resolve, reject) => {
		let records = event.Records;
		if (records && records instanceof Array) {
			return Promise.all(records.map((record, index)=>{
				log.silly({operation:'processEvent', index, eventName: record.eventName});
				return processRecord(record);
			}));
		} else {
			log.debug({operation:'processEvent', status:'No Records', records});
		}
	})
	.catch(error => {
		dump(record);
		log.error({operation:'processEvent', error});
		reject(error);
	});
}

function processRecord(record) {
	let eventSource = record.eventSource;
	switch (eventSource) {
		case 'aws:s3':
				return processS3Record(record);
			break;
		default:
			dump(record);
			log.error({operation:'processRecord', status:'unhandled eventSource', eventSource});
			return Promise.reject(new errors.Warning(`${eventSource} unhandled`));
	}
}

function processS3Record(record) {
	log.silly({operation:'processS3Record', eventName:record.eventName});
	let eventName = record.eventName;
	switch (eventName) {
		case 'ObjectCreated:Put':
			return processS3Put(record);
			break;
		default:
			dump(record);
			log.error({operation:'processS3Record', status:'unhandled eventName', eventName});
			return Promise.reject(new errors.Warning(`${eventName} unhandled`));
	}
}

function processS3Put(record) {
	// dump(record);
	log.silly({operation:'processS3Put', userIdentity: record.userIdentity.principalId, bucketName: record.s3.bucket.name, s3Object: record.s3.object.key });
}

module.exports = {
	processEvent
};
