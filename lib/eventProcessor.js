'use strict';

const log = require('@financial-times/n-lambda').logger;
const reportProcessor = require('./reportProcessor');
const errors = require(`./errors`);
const AWS = require('aws-sdk');
const fs = require('fs');

function dump(object) {
	log.debug({operation:'dumpObject', object:JSON.stringify(object)});
}

function processEvent(event) {
	return new Promise((resolve, reject) => {
		let result;
		try {
			let records = event.Records;
			if (records && records instanceof Array) {
				let promises = records.map((record, index)=>{
					log.silly({operation:'processEvent', index, eventName: record.eventName});
					result = processRecord(record);
				});
				result = Promise.all(promises);
			} else if (event.httpMethod && event.path && event.resource && event.headers && event.requestContext && event.body) {
				result = processAPIGWProxy(event);
			} else if (event.isPingTest) {
				result = resolve(processPing(event));
			}
			else {
				log.error({operation:'processEvent', status:'Unhandled Event'});
				throw new errors.Warning('Unhandled event');
			}
		} catch (error) {
			dump(event);
			log.error({operation:'processEvent', error});
			reject(error);
		};
		resolve(result);
	});
}

function processPing(event) {
	log.debug({operation:'processPing', event:JSON.stringify(event)});
	if (event.isFatal) {
		throw new errors.Fatal("Fatal ping test");
	} else if (event.isWarning) {
		throw new errors.Warning("Warning ping test");
	}
	return({statusCode:200, body:"ping test successful"});
}

function processAPIGWProxy(event) {
	if (event.body.length > 0) {
		let body = JSON.parse(event.body);
		if (body.messages && body.messages instanceof Array) {
			results = body.messages.map((message)=>{
				return messageProcessor(message);
			});
		} else {
			let msg = 'Unhandled API Gateway request, body.messages was empty or not an array!';
			log.error({operation: 'processAPIGWProxy', messages: body.messages, tatus: msg});
			throw new errors.Warning(msg);
		}
	} else {
		let msg = 'Unhandled API Gateway request, body was empty!';
		throw new errors.Warning(msg);
	}
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
		return Promise.reject(new errors.Warning('Unhandled recordType'));
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
			log.error({operation:'processS3Event', status:'Unhandled eventName', eventName});
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

module.exports = processEvent;
