'use strict';

const log = require('@financial-times/n-lambda').logger;
const reportProcessor = require('./reportProcessor');
const errors = require(`./errors`);
const aws = require('aws-sdk');

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
	let bucketName = record.s3.bucket.arn;
	let reportMatcher = /^([a-zA-Z\/]*)\/([a-zA-Z\-]*)-([0-9]*)\.([a-zA-Z]){1,3}$/;
	let match = reportMatcher.exec();
	if (match && match.length>4) {
		let prefix = match[1], reportType = match[2], timestamp = match[3];
		log.silly({operation:'processS3Put', s3ObjectKey, reportType, timestamp});
  	let s3 = new AWS.S3();
		let outFile = `${prefix}/${reportType}-${timestamp}-result.csv`;
  	let inputStream = s3.getObject({Bucket: bucketName, Key: s3ObjectKey}).createReadStream();
    let outputStream = s3.putObject({Bucket: bucketName, Key: outFile}).createWriteStream();
		return reportProcessor({inputStream, outputStream, reportType});
	} else {
		log.error({operation:'processS3Put', status:'unhandled s3ObjectKey', s3ObjectKey});
		return Promise.reject(errors.Warning(`unhandled s3ObjectKey ${s3ObjectKey}`));
	}
}

module.exports = processEvent;
