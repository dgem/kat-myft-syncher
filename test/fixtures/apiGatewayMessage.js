'use strict';
const uuid = require('uuid');
const log = require('@financial-times/n-lambda').logger;

function message(msg) {
	msg = msg || {};
	msg.body = msg.body || {messages:[]};
	let res = {
	  headers: headers(msg.headers||{}),
	  queryStringParameters: msg.queryStringParameters || null,
	  pathParameters: msg.pathParameters || null,
	  stageVariables: msg.stageVariables || null,
	  requestContext: requestContext(msg.requestContext),
		"apiId": msg.apiId || "606os4gyyc",
	};
	if (msg.resourcePath === '/__gtg') {
		res.resourcePath = msg.resourcePath;
		res.resource = msg.resource || '/gtg';
	  res.path = msg.path || '/__gtg';
	  res.httpMethod= msg.httpMethod || "GET";
	} else {
		res.resource= msg.resource || '/membership';
	  res.path= msg.path || '/membership';
		res.httpMethod= msg.httpMethod || "POST";
		res.resourcePath= msg.resourcePath || msg.path || msg.resource || '/membership';
		res.body = msg.body;
		res.body.topic = msg.body.topic || "membership_users_v1";
	  res.body.isBase64Encoded = msg.isBase64Encoded || false;
		res.body.messages = bodyMessages(msg.body.messages);
	}
	return res;
}

function headers(msgHeaders) {
	let defaultHeaders = {
	    "Accept-Encoding": "gzip,deflate",
	    "Content-Encoding": "gzip",
	    "Content-Type": "application/json;charset=utf-8",
	    "Host": "606os4gyyc.execute-api.eu-west-1.amazonaws.com",
	    "User-Agent": "KafkaHttpBridge (membership_users_v1-b2b-kat-myft-syncher)",
	    "X-Amzn-Trace-Id": "Root=1-58a936c3-225e33571e04623c6e3db9fb",
	    "X-Api-Key": uuid(),
	    "X-Forwarded-For": "54.194.189.228, 216.137.56.93",
	    "X-Forwarded-Port": "443",
	    "X-Forwarded-Proto": "https",
	    "X-Request-Id": uuid()
	};
	return Object.apply(defaultHeaders, msgHeaders);
}

function requestContext(context) {
	context = Object.apply({}, context);
	return {
		"accountId": context.accountId || "123456789",
		"resourceId": context.resourceId ||"w7lnsd",
		"stage": context.stage || "prod",
		"requestId": context.requestId || uuid(),
		"identity": identity(context.identity),
	};
}

function identity(data) {
	data = Object.apply({}, data);
	return {
		"cognitoIdentityPoolId": null,
		"accountId": null,
		"cognitoIdentityId": null,
		"caller": null,
		"apiKey": data.apiKey,
		"sourceIp": "54.194.189.228",
		"accessKey": null,
		"cognitoAuthenticationType": null,
		"cognitoAuthenticationProvider": null,
		"userArn": null,
		"userAgent": data.userAgent || "KafkaHttpBridge (membership_users_v1-b2b-kat-myft-syncher)",
		"user": data.user||null
	};
}

function bodyMessages(messages) {
	return messages.map((ftMsg)=>{
		ftMsg = ftMsg===undefined? {}: ftMsg;
		return ftMessage(ftMsg);
	});
}

function ftMessage(ftMsg){
	ftMsg = ftMsg === undefined? {} : ftMsg;
	return {
		correlationId: ftMsg.correlationId || uuid(),
		messageTimestamp: ftMsg.messageTimestamp,
		originSystemId: ftMsg.originSystemId || "http://cmdb.ft.com/systems/user-api",
		originHostLocation: ftMsg.originHostLocation || "w1b",
		originHost: ftMsg.originHost || "ip-10-170-46-15",
		contentType: ftMsg.contentType || "application/json",
		"messageId": ftMsg.Id || uuid(),
		"body": ftMessageBody(ftMsg.messageType, ftMsg.body),
		"customHeaders": {
			"FT-Transaction-Id": ftMsg.ftTransactionId || uuid()
		},
		"messageType": ftMsg.messageType
	};
}

function ftMessageBody(msgType, msgBody) {
	msgBody = (msgBody===undefined?{}:msgBody);
	let body;
	switch (msgType) {
		case 'UserCreated':
			let user = msgBody.user===undefined?{}:msgBody.user;
			body = {
				user:{
					id: user.id || uuid(),
					email: user.email,
					title: user.title,
					firstName: user.firstName || "",
					lastName: user.lastName || "",
					primaryTelephone: user.telephone || "",
					homeAddress: user.homeAddress || {line1:"", line2:"", townCity: null, state: null, postcode: null, country: "GBR"},
					marketing: user.marketing || {ftByEmail:false, ftByPost:false},
					demographics: user.demographics || { industry:null, position:null, responsibility:null}
				}
			};
			break;
		case 'LicenceSeatAllocated':
			let licenceSeatAllocated = msgBody.licenceSeatAllocated===undefined?{}:msgBody.licenceSeatAllocated;
			body = {
				licenceSeatAllocated: {
					licenceId: licenceSeatAllocated.licenceId || uuid(),
					userId: licenceSeatAllocated.userId || uuid(),
					joinedDate: licenceSeatAllocated.joinDate || new Date().toISOString(),
					seatExpiryDate: licenceSeatAllocated.seatExpiryDate || null
				}
			};
			break;
			case 'LicenceSeatDeallocated':
				let licenceSeatDeallocated = msgBody.licenceSeatDeallocated===undefined?{}:msgBody.licenceSeatDeallocated;
				body = {
					licenceSeatDeallocated: {
						licenceId: licenceSeatDeallocated.licenceId || uuid(),
						userId: licenceSeatDeallocated.userId || uuid(),
						joinedDate: licenceSeatDeallocated.joinDate || new Date().toISOString(),
						seatExpiryDate: licenceSeatDeallocated.seatExpiryDate || null
					}
				};
				break;
			case 'UserProductsChanged':
				let userProductsChanged = msgBody.userProductsChanged===undefined?{user:{}}:msgBody.userProductsChanged;
				body = {
					userProductsChanged: {
						user: {
							userId: userProductsChanged.user.id || uuid(),
							products: userProductsChanged.user.products || []
						// 	[
						// 	{
						// 		"productCode": "Tools"
						// 	},
						// 	{
						// 		"productCode": "P0"
						// 	}
						// ]
					}
				}
			};
			break;
		default:
	}
	log.silly({operation:'ftMessageBody', ftMessageBody:JSON.stringify(body)});
	return body;
}

module.exports=message;
