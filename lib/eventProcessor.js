'use strict';

const log = require('@financial-times/n-lambda').logger;
const reportProcessor = require('./reportProcessor');
const errors = require(`./errors`);

function dump(object) {
	log.debug({operation:'objectDump', object:JSON.stringify(object)});
}

function processEvent(event) {
	return new Promise((resolve, reject) => {
		let records = event.Records;
		if (records && records instanceof Array) {
			let promises = records.map((record, index)=>{
				log.silly({operation:'processEvent', index, eventName: record.eventName});
				return processRecord(record);
			});
			return Promise.all(promises);
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
	let recordType = (record.kinesis?'kinesis':undefined) || (record.s3?'s3':undefined);
	switch (recordType) {
		case 'kinesis':
			return processKinesis(record);
			break;
		case 's3':
			return processS3(record);
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

// function processS3(record){
// 	let eventSource = record.eventSource;
// 	switch (eventSource) {
// 		case 'aws:s3':
// 				return processS3Event(record);
// 			break;
// 		default:
// 			dump(record);
// 			log.error({operation:'processEvent', status:'unhandled eventSource', eventSource});
// 			return Promise.reject(new errors.Warning(`evnetSource: ${eventSource} unhandled`));
// 	}
// }

function processS3(record) {
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
	let s3ObjectKey = record.s3.object.key;
	let reportMatcher = /^reports\/myft\/([a-zA-Z\-]*)-([0-9]*)\.([a-zA-Z]){1,3}$/;
	let match = reportMatcher.exec();
	if (match) {
		log.silly({operation:'processS3Put', match:match[0], report:match[1], timestamp:match[2]});
	} else {
		log.error({operation:'processS3Put', status:'unhandled s3ObjectKey', s3ObjectKey});
		return Promise.reject(errors.Warning(`unhandled s3ObjectKey ${s3ObjectKey}`));
	}
}

module.exports = processEvent;
