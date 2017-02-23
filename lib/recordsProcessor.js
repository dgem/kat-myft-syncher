'use strict';

const log = require('@financial-times/n-lambda').logger;
const stringify =require('./logHelper').stringify;
const reportProcessor = require('./reportProcessor');
const status = require('./statusProcessor');
const errors = require('./errors');
const AWS = require('aws-sdk');
const fs = require('fs');


function process(event){
	let result;
	let records = event.Records;
	if (records && records instanceof Array) {
		let promises = records.map((record, index)=>{
			log.silly({operation:'processEvent', index, eventName: record.eventName});
			return processRecord(record);
		});
		result = Promise.all(promises);
	}
	return result;
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
		log.error({operation:'prcoessRecord', status:'Unhandled recordType', recordType, record:stringify(record)});
		return Promise.reject(new errors.Warning(`Unhandled recordType ${recordType}`));
	}
}

function processKinesis(record) {
	let msg = JSON.parse(new Buffer(record.kinesis.data, "base64"));
	log.error({operation:'processKinesis', status:'Unhandled msg', msg, record:stringify(record)});
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
			log.error({operation:'processS3Event', status:'Unhandled eventName', eventName, record:stringify(record)});
			return Promise.reject(new errors.Warning(`${eventName} unhandled`));
	}
}

function processS3Put(record) {
	let s3ObjectKey = record.s3.object.key;
	let bucketName = record.s3.bucket.arn;
	let reportMatcher = /^([a-zA-Z\/]*)\/([a-zA-Z\-]*)-([0-9]*)\.([a-zA-Z]){1,3}$/;
	let match = reportMatcher.exec(s3ObjectKey);
	if (match && match.length>4) {
		let prefix = match[1], reportType = match[2], timestamp = match[3];
		log.silly({operation:'processS3Put', s3ObjectKey, reportType, timestamp});
  	let s3 = new AWS.S3();
		let outFile = `/tmp/${reportType}-${timestamp}-result.csv`;
  	let inputStream = s3.getObject({Bucket: bucketName, Key: s3ObjectKey}).createReadStream();
		let outputStream = fs.createWriteStream(outFile);
    // let outputStream = s3.putObject({Bucket: bucketName, Key: outFile}).createWriteStream();
		return reportProcessor(inputStream, outputStream, reportType)
		.then(()=>{
			s3.putObject({Bucket: bucketName, Body:outputStream});
		});
	} else {
		log.error({operation:'processS3Put', status:'unhandled s3ObjectKey', s3ObjectKey});
		return Promise.reject(new errors.Warning(`Unhandled s3ObjectKey ${s3ObjectKey}`));
	}
}

module.exports=process;
