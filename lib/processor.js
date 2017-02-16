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
	let recordType = (record.kinesis?'kinesis':undefined) || (record.eventSource?'eventSource':undefined);
	switch (recordType) {
		case 'kinesis':
			return processKinesis(record);
			break;
		case 'eventSource':
			return processEvent(record);
			break;
		default:
		dump(record);
		log.error({operation:'prcoessRecord', status:'Unknown recordType'});
		return Promise.reject(new errors.Warning('Unknown recordType'));
	}
}

function processKinesis(record) {
	let msg = JSON.parse(new Buffer(record.kinesis.data, "base64"));
	dump(msg);
	return Promise.reject(new error.Warning('Unhandled kinesis record'));
}

function processEvent(record){
	let eventSource = record.eventSource;
	switch (eventSource) {
		case 'aws:s3':
				return processS3Event(record);
			break;
		default:
			dump(record);
			log.error({operation:'processEvent', status:'unhandled eventSource', eventSource});
			return Promise.reject(new errors.Warning(`${eventSource} unhandled`));
	}
}

function processS3Event(record) {
	log.silly({operation:'processS3Event', eventName:record.eventName});
	let eventName = record.eventName;
	switch (eventName) {
		case 'ObjectCreated:Put':
			return processS3Put(record);
			break;
		default:
			dump(record);
			log.error({operation:'processS3Event', status:'unhandled eventName', eventName});
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
